from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.utils import timezone
from concurrent.futures import ThreadPoolExecutor, TimeoutError, as_completed
import json
import os
import re
import xml.etree.ElementTree as ET
import uuid

import requests

from .models import VoiceConversation, VoiceTranscript, VoiceAgentResponse, VoiceLog
from .serializers import VoiceConversationSerializer, VoiceTranscriptSerializer, VoiceAgentResponseSerializer, VoiceLogSerializer
from .mock_responses import get_mock_response


def _extract_json_object(text):
	start = text.find('{')
	end = text.rfind('}')
	if start == -1 or end == -1 or end <= start:
		raise ValueError('No JSON object found in model response')
	return json.loads(text[start:end + 1])


def _gemini_api_key():
	return os.getenv('GEMINI_API_KEY') or os.getenv('VITE_GEMINI_API_KEY')


def _generate_gemini_text(prompt, tools=None):
	api_key = _gemini_api_key()
	if not api_key:
		raise RuntimeError('Gemini API key is not configured')

	model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
	url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
	payload = {'contents': [{'parts': [{'text': prompt}]}]}
	if tools:
		payload['tools'] = tools
	response = requests.post(
		url,
		params={'key': api_key},
		json=payload,
		timeout=25,
	)
	response.raise_for_status()
	data = response.json()
	return data['candidates'][0]['content']['parts'][0].get('text', '')


HOME_UPDATE_KEYWORDS = (
	'farmer', 'farmers', 'agriculture', 'agricultural', 'crop', 'crops',
	'mandi', 'msp', 'kisan', 'pm-kisan', 'scheme', 'subsidy', 'loan',
	'fertilizer', 'fertiliser', 'irrigation', 'harvest', 'procurement',
	'किसान', 'कृषि', 'फसल', 'मंडी', 'योजना'
)

VERIFIED_FEEDS = (
	{
		'name': 'Press Information Bureau',
		'url': 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
	},
	{
		'name': 'Press Information Bureau',
		'url': 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1',
	},
	{
		'name': 'Prime Minister of India',
		'url': 'https://www.pmindia.gov.in/en/news_updates/feed/',
	},
)

SOURCE_FETCH_TIMEOUT = int(os.getenv('HOME_UPDATES_SOURCE_TIMEOUT', '12'))


def _clean_text(value):
	text = re.sub(r'<[^>]+>', ' ', value or '')
	return re.sub(r'\s+', ' ', text).strip()


def _safe_error_message(error):
	message = str(error)
	message = re.sub(r'key=[^&\s)]+', 'key=***', message)
	return message[:300]


def _is_farmer_related(*values):
	haystack = ' '.join(_clean_text(value).lower() for value in values)
	return any(keyword in haystack for keyword in HOME_UPDATE_KEYWORDS)


def _fetch_single_feed(feed, limit=8):
	updates = []
	headers = {'User-Agent': 'GraamSeva/1.0 farmer-updates'}
	response = requests.get(feed['url'], headers=headers, timeout=SOURCE_FETCH_TIMEOUT)
	response.raise_for_status()
	root = ET.fromstring(response.content)
	items = root.findall('.//item')

	for item in items:
		title = _clean_text(item.findtext('title'))
		desc = _clean_text(item.findtext('description'))
		link = _clean_text(item.findtext('link'))
		date = _clean_text(item.findtext('pubDate'))

		if not title or not link or not _is_farmer_related(title, desc):
			continue

		updates.append({
			'id': f"feed-{len(updates) + 1}",
			'title': title,
			'desc': desc[:450],
			'date': date,
			'type': 'new',
			'badge': 'Govt Update',
			'url': link,
			'sourceName': feed['name'],
		})

		if len(updates) >= limit:
			break

	return updates


def _fetch_feed_updates(limit=8):
	updates = []
	with ThreadPoolExecutor(max_workers=len(VERIFIED_FEEDS)) as executor:
		futures = [executor.submit(_fetch_single_feed, feed, limit) for feed in VERIFIED_FEEDS]
		try:
			for future in as_completed(futures, timeout=SOURCE_FETCH_TIMEOUT + 2):
				if len(updates) >= limit:
					break
				try:
					updates.extend(future.result())
				except Exception:
					continue
		except TimeoutError:
			pass

	return updates[:limit]


def _fetch_all_source_updates(request_data, max_items):
	with ThreadPoolExecutor(max_workers=2) as executor:
		futures = [
			executor.submit(_fetch_mandi_updates, request_data, 4),
			executor.submit(_fetch_feed_updates, max(4, max_items)),
		]
		updates = []
		try:
			for future in as_completed(futures, timeout=SOURCE_FETCH_TIMEOUT + 6):
				try:
					updates.extend(future.result())
				except Exception:
					continue
		except TimeoutError:
			pass
	return updates[:max_items]


def _fetch_grounded_updates_with_gemini(language='en', max_items=10):
	prompt = f"""
Search only official government/public-source websites for current farmer-relevant updates in India.
Allowed source domains include pib.gov.in, data.gov.in, agricoop.gov.in, agriwelfare.gov.in, enam.gov.in, pmindia.gov.in, and other .gov.in sources.
Find recent information useful to farmers: mandi prices, new schemes, subsidies, agriculture policy updates, bills, advisories, procurement/MSP, and farmer loans.

Return strict JSON only:
{{"updates":[{{"id":"","title":"","desc":"","badge":"","date":"","type":"new|update|market","url":"","sourceName":""}}]}}

Rules:
- Return at most {max_items} updates.
- title, desc, and badge must be in this selected language: {language}.
- Every item must include a real official source URL.
- Do not include unsourced items.
- Use type "market" for mandi/price updates, "new" for new schemes/news/bills, and "update" for continuing advisories/policies.
"""
	data = _extract_json_object(_generate_gemini_text(prompt, tools=[{'google_search': {}}]))
	updates = data.get('updates', [])
	return updates if isinstance(updates, list) else []


def _fetch_feed_updates_sequential(limit=8):
	updates = []
	for feed in VERIFIED_FEEDS:
		try:
			updates.extend(_fetch_single_feed(feed, limit))
			if len(updates) >= limit:
				break
		except Exception:
			continue

	return updates[:limit]


def _fetch_mandi_updates(request_data, limit=6):
	api_key = os.getenv(
		'DATA_GOV_API_KEY',
		'579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
	)
	params = {
		'api-key': api_key,
		'format': 'json',
		'offset': 0,
		'limit': limit,
	}
	location = request_data.get('location') or {}
	state = location.get('state') or request_data.get('state')
	district = location.get('district') or request_data.get('district')
	if state:
		params['filters[state]'] = state
	if district:
		params['filters[district]'] = district

	url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'

	try:
		response = requests.get(url, params=params, timeout=SOURCE_FETCH_TIMEOUT)
		response.raise_for_status()
		records = response.json().get('records', [])
	except Exception:
		return []

	updates = []
	for record in records[:limit]:
		commodity = record.get('commodity') or 'Commodity'
		market = record.get('market') or 'Mandi'
		district_name = record.get('district') or ''
		state_name = record.get('state') or ''
		modal_price = record.get('modal_price') or record.get('Modal Price')
		min_price = record.get('min_price')
		max_price = record.get('max_price')
		arrival_date = record.get('arrival_date') or ''
		place = ', '.join(part for part in [market, district_name, state_name] if part)

		updates.append({
			'id': f"mandi-{len(updates) + 1}",
			'title': f"{commodity} mandi price in {market}",
			'desc': f"Modal price Rs {modal_price}/quintal at {place}. Range Rs {min_price}-{max_price}/quintal.",
			'date': arrival_date,
			'type': 'market',
			'badge': 'Mandi Price',
			'url': 'https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi',
			'sourceName': 'data.gov.in / Agmarknet',
		})

	return updates


class VoiceConversationViewSet(viewsets.ModelViewSet):
	queryset = VoiceConversation.objects.all()
	serializer_class = VoiceConversationSerializer
	lookup_field = 'conversation_id'
    
	def create(self, request):
		try:
			conversation_id = str(uuid.uuid4())[:12]
			conversation = VoiceConversation.objects.create(
				conversation_id=conversation_id,
				farmer_phone=request.data.get('farmer_phone'),
				farmer_name=request.data.get('farmer_name'),
				language=request.data.get('language', 'en'),
				context=request.data.get('context', {})
			)
			serializer = self.get_serializer(conversation)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		except Exception:
			return Response({'conversation_id': str(uuid.uuid4())[:12], 'source': 'mock'}, status=status.HTTP_201_CREATED)


class VoiceTranscriptViewSet(viewsets.ModelViewSet):
	queryset = VoiceTranscript.objects.all()
	serializer_class = VoiceTranscriptSerializer
    
	def create(self, request):
		try:
			transcript_id = str(uuid.uuid4())[:12]
			conversation = VoiceConversation.objects.get(conversation_id=request.data.get('conversation_id'))
			transcript = VoiceTranscript.objects.create(
				transcript_id=transcript_id,
				conversation=conversation,
				role='user',
				language=request.data.get('language', 'en'),
				original_text=request.data.get('original_text', ''),
				translated_text=request.data.get('translated_text'),
				confidence=request.data.get('confidence', 0.9)
			)
			serializer = self.get_serializer(transcript)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		except Exception:
			return Response({'transcript_id': str(uuid.uuid4())[:12], 'source': 'mock'}, status=status.HTTP_201_CREATED)


class VoiceAgentViewSet(viewsets.ViewSet):
	def _localize_home_updates(self, source_updates, language='en', max_items=10):
		if not source_updates:
			return []

		if language == 'en':
			return source_updates[:max_items]

		system_instruction = """You localize verified government-source farmer updates for GraamSeva.
Return strict JSON only: {"updates":[{"id":"","title":"","desc":"","badge":"","date":"","type":"update|new|market","url":"","sourceName":""}]}.
Translate title, desc, and badge into the requested language only. Preserve id, date, type, url, and sourceName exactly.
Do not add claims, facts, links, or updates that are not present in the provided source JSON."""
		prompt = f"""
{system_instruction}

LANGUAGE CODE: {language}
SOURCE UPDATES JSON:
{json.dumps(source_updates[:max_items], ensure_ascii=False)}
"""
		data = _extract_json_object(_generate_gemini_text(prompt))
		updates = data.get('updates', [])
		return updates if isinstance(updates, list) else source_updates[:max_items]

	def _generate_with_gemini(self, query, language='en', context=None):
		context = context or {}
		profile = context.get('profile') or {}
		location = context.get('location') or {}

		system_instruction = """You are the GraamSeva AI Assistant for Indian farmers.
Return strict JSON only with this shape:
{"message":"max 4 helpful sentences in the user's language","speak":"one spoken sentence","redirect":"home|schemes|mandi|loan|apply|history","result":{"items":[{"Label":"Value","Detail":"Description"}]}}
Respect the user's language code exactly. hi, bho, awa, mr and mai should use Devanagari, or should use Odia, en should use English.
Route scheme/subsidy questions to schemes, mandi/crop price questions to mandi, bank/tractor/credit questions to loan, application questions to apply, status/history questions to history."""

		prompt = f"""
USER LANGUAGE: {language}
PROFILE: {json.dumps(profile, ensure_ascii=False)}
LOCATION: {json.dumps(location, ensure_ascii=False)}
QUERY: {query}
"""

		return _extract_json_object(_generate_gemini_text(f"{system_instruction}\n\n{prompt}"))

	@action(detail=False, methods=['post'])
	def chat(self, request):
		try:
			query = request.data.get('query', '')
			language = request.data.get('language', 'en')
			response_id = str(uuid.uuid4())[:12]
			try:
				ai_response = self._generate_with_gemini(query, language, request.data.get('context', {}))
				return Response({**ai_response, 'response_id': response_id, 'source': 'gemini'})
			except Exception as ai_error:
				ai_response = get_mock_response(query, language)
				return Response({**ai_response, 'response_id': response_id, 'source': 'mock', 'fallback_reason': str(ai_error)})
		except Exception:
			language = request.data.get('language', 'en')
			return Response(get_mock_response('', language))

	@action(detail=False, methods=['post'])
	def home_updates(self, request):
		language = request.data.get('language', 'en')
		max_items = int(request.data.get('maxItems', 10) or 10)
		cache_seconds = int(os.getenv('HOME_UPDATES_CACHE_SECONDS', '21600'))
		location = request.data.get('location') or {}
		cache_location = f"{location.get('state', '')}:{location.get('district', '')}"
		cache_key = f"home_updates:{language}:{cache_location}:{max_items}"
		cached = cache.get(cache_key)
		if cached:
			return Response(cached)

		try:
			source_updates = _fetch_all_source_updates(request.data, max_items)
			if source_updates:
				cache.set('home_updates:last_verified_sources', source_updates, cache_seconds * 2)
			else:
				source_updates = cache.get('home_updates:last_verified_sources', [])

			if not source_updates:
				updates = _fetch_grounded_updates_with_gemini(language, max_items)
				payload = {
					'updates': updates,
					'source': 'gemini-grounded-government-search',
					'lastFetched': timezone.now().isoformat(),
					'refreshAfterSeconds': cache_seconds,
					'sources': sorted({item.get('sourceName') for item in updates if item.get('sourceName')}),
				}
				cache.set(cache_key, payload, cache_seconds)
				return Response(payload)

			try:
				updates = self._localize_home_updates(source_updates, language, max_items)
			except Exception:
				updates = source_updates[:max_items]
			payload = {
				'updates': updates,
				'source': 'verified-government-sources',
				'lastFetched': timezone.now().isoformat(),
				'refreshAfterSeconds': cache_seconds,
				'sources': sorted({item.get('sourceName') for item in source_updates if item.get('sourceName')}),
			}
			cache.set(cache_key, payload, cache_seconds)
			return Response(payload)
		except Exception as error:
			return Response({
				'updates': [],
				'source': 'verified-government-sources',
				'error': _safe_error_message(error),
				'lastFetched': timezone.now().isoformat(),
				'refreshAfterSeconds': cache_seconds,
			})

	@action(detail=False, methods=['post'])
	def nearby_loans(self, request):
		language = request.data.get('language', 'en')
		try:
			query = 'Suggest nearby farmer loan and tractor finance options with bank, branch, interest rate and documents'
			ai_response = self._generate_with_gemini(query, language, request.data)
			items = ai_response.get('result', {}).get('items', [])
			offers = [
				{
					'id': f'ai-loan-{index + 1}',
					'bankName': item.get('Bank') or item.get('Label') or item.get('बैंक') or 'Bank',
					'branch': item.get('Branch') or item.get('Detail') or 'Nearby Branch',
					'annualInterestRate': item.get('Interest') or item.get('Rate') or 8.5,
					'distanceKm': item.get('Distance') or 0,
					'documents': item.get('Documents') or ['Aadhaar Card', 'Income/Land Proof'],
					'aiSummary': item.get('Detail') or item.get('Value') or '',
				}
				for index, item in enumerate(items)
			]
			return Response({'offers': offers, 'source': 'gemini'})
		except Exception:
			return Response({'offers': [], 'source': 'mock'})

	@action(detail=False, methods=['post'])
	def tts(self, request):
		return Response({'audioUrl': None, 'duration': 0, 'source': 'browser'})


class VoiceLogViewSet(viewsets.ModelViewSet):
	queryset = VoiceLog.objects.all()
	serializer_class = VoiceLogSerializer
