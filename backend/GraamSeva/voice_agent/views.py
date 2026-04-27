from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.db.models import Q
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
from data.models import FarmerUpdate, LoanOption, Scheme
from data.mock_data import get_mock_loan_options, get_mock_schemes


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


def _language_for_google_translate(language):
	lang = (language or 'en').lower()
	mapping = {
		'hi': 'hi',
		'bho': 'hi',
		'awa': 'hi',
		'mai': 'hi',
		'mr': 'mr',
		'or': 'or',
		'en': 'en',
	}
	return mapping.get(lang, 'hi')


def _translate_text_free(text, target_language):
	text = str(text or '').strip()
	if not text:
		return text
	if target_language == 'en':
		return text
	try:
		res = requests.get(
			'https://translate.googleapis.com/translate_a/single',
			params={
				'client': 'gtx',
				'sl': 'auto',
				'tl': _language_for_google_translate(target_language),
				'dt': 't',
				'q': text,
			},
			timeout=8,
		)
		res.raise_for_status()
		data = res.json()
		return ''.join(part[0] for part in data[0] if part and part[0]).strip() or text
	except Exception:
		return text


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
PIB_LATEST_URL = 'https://www.pib.gov.in/indexd.aspx?reg=3&lang=1'
DAILY_REFRESH_HOURS = int(os.getenv('HOME_UPDATES_REFRESH_HOURS', '24'))


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


def _absolute_pib_url(href):
	if not href:
		return ''
	if href.startswith('http'):
		return href
	return f"https://www.pib.gov.in/{href.lstrip('/')}"


def _upsert_farmer_update(item):
	FarmerUpdate.objects.update_or_create(
		update_id=item['update_id'],
		defaults={
			'category': item['category'],
			'title': item['title'][:500],
			'description': item.get('description', ''),
			'source_name': item.get('source_name', ''),
			'source_url': item.get('source_url', ''),
			'published_at': item.get('published_at', ''),
			'state': item.get('state', ''),
			'district': item.get('district', ''),
			'tags': item.get('tags', []),
			'payload': item.get('payload', {}),
		},
	)


def _fetch_pib_latest_press_releases(limit=30):
	response = requests.get(
		PIB_LATEST_URL,
		headers={'User-Agent': 'GraamSeva/1.0 farmer-updates'},
		timeout=SOURCE_FETCH_TIMEOUT,
	)
	response.raise_for_status()
	html = response.text
	start = html.lower().find('latest press releases')
	end = html.lower().find('latest explainers', start if start >= 0 else 0)
	section = html[start:end if end > start else None] if start >= 0 else html
	seen = set()
	items = []

	for href, text in re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', section, flags=re.I | re.S):
		title = _clean_text(text)
		url = _absolute_pib_url(href)
		if not title or len(title) < 12 or url in seen:
			continue
		if any(skip in title.lower() for skip in ['more +', 'image', 'skip to']):
			continue
		seen.add(url)
		items.append({
			'update_id': f"pib:{url}",
			'category': 'press_release',
			'title': title,
			'description': title,
			'source_name': 'Press Information Bureau',
			'source_url': url,
			'published_at': timezone.now().date().isoformat(),
			'tags': ['pib', 'press-release', *_clean_text(title).lower().split()[:8]],
			'payload': {'sourcePage': PIB_LATEST_URL},
		})
		if len(items) >= limit:
			break

	return items


def _seed_scheme_updates(request_data, limit=20):
	location = request_data.get('location') or {}
	state = str(location.get('state') or request_data.get('state') or '').lower()
	if Scheme.objects.exists():
		schemes = Scheme.objects.all()
		if state:
			schemes = [scheme for scheme in schemes if not scheme.states or 'ALL' in scheme.states or any(state in str(s).lower() for s in scheme.states)]
		else:
			schemes = list(schemes)
		items = [
			{
				'update_id': f"scheme:{scheme.scheme_id}",
				'category': 'scheme',
				'title': scheme.name,
				'description': scheme.details,
				'source_name': 'PIB / Agriwelfare',
				'source_url': 'https://agricoop.gov.in/',
				'state': state,
				'tags': ['scheme', 'farmer', 'government', *scheme.states],
				'payload': {'scheme_id': scheme.scheme_id},
			}
			for scheme in schemes[:limit]
		]
	else:
		items = [
			{
				'update_id': f"scheme:{scheme.get('scheme_id', scheme.get('id'))}",
				'category': 'scheme',
				'title': scheme.get('name', ''),
				'description': scheme.get('description') or scheme.get('details', ''),
				'source_name': 'PIB / Agriwelfare',
				'source_url': 'https://agricoop.gov.in/',
				'state': state,
				'tags': ['scheme', 'farmer', 'government', *scheme.get('states', [])],
				'payload': scheme,
			}
			for scheme in get_mock_schemes('en')[:limit]
		]
	return items


def _seed_loan_updates(request_data, limit=20):
	location = request_data.get('location') or {}
	state = str(location.get('state') or request_data.get('state') or '').lower()
	if LoanOption.objects.exists():
		loans = LoanOption.objects.all()[:limit]
		items = [
			{
				'update_id': f"loan:{loan.loan_id}",
				'category': 'loan',
				'title': f"{loan.bank_name} {loan.loan_type.replace('_', ' ').title()}",
				'description': f"{loan.branch_name}: {loan.annual_interest_rate}% annual interest, amount Rs {loan.min_amount}-{loan.max_amount}.",
				'source_name': 'Jansamarth',
				'source_url': loan.website or 'https://www.jansamarth.in/home',
				'state': state,
				'tags': ['loan', 'bank', 'credit', loan.loan_type.lower()],
				'payload': {'loan_id': loan.loan_id},
			}
			for loan in loans
		]
	else:
		items = [
			{
				'update_id': f"loan:{loan.get('loan_id', loan.get('id'))}",
				'category': 'loan',
				'title': f"{loan.get('bank_name', 'Bank')} {loan.get('loan_type', 'Loan')}",
				'description': f"{loan.get('branch_name', 'Branch')}: {loan.get('annual_interest_rate')}% annual interest, amount Rs {loan.get('min_amount')}-{loan.get('max_amount')}.",
				'source_name': 'Jansamarth',
				'source_url': loan.get('website') or 'https://www.jansamarth.in/home',
				'state': state,
				'tags': ['loan', 'bank', 'credit'],
				'payload': loan,
			}
			for loan in get_mock_loan_options('en')[:limit]
		]
	return items


def _seed_mandi_update_rows(request_data, limit=10):
	return [
		{
			'update_id': f"mandi:{item.get('title')}:{item.get('date')}",
			'category': 'mandi',
			'title': item.get('title', ''),
			'description': item.get('desc', ''),
			'source_name': item.get('sourceName', 'data.gov.in / Agmarknet'),
			'source_url': item.get('url', ''),
			'published_at': item.get('date', ''),
			'tags': ['mandi', 'price', 'crop'],
			'payload': item,
		}
		for item in _fetch_mandi_updates(request_data, limit=limit)
	]


def _refresh_farmer_update_db_if_needed(request_data):
	last_update = FarmerUpdate.objects.order_by('-fetched_at').first()
	force_refresh = bool(request_data.get('forceRefresh'))
	if not force_refresh and last_update and (timezone.now() - last_update.fetched_at).total_seconds() < DAILY_REFRESH_HOURS * 3600:
		return False

	items = []
	for fetcher in (
		lambda: _fetch_pib_latest_press_releases(limit=30),
		lambda: _seed_mandi_update_rows(request_data, limit=12),
		lambda: _seed_scheme_updates(request_data, limit=30),
		lambda: _seed_loan_updates(request_data, limit=30),
	):
		try:
			items.extend(fetcher())
		except Exception:
			continue

	for item in items:
		if item.get('title'):
			_upsert_farmer_update(item)

	if not any(item.get('category') == 'press_release' for item in items):
		try:
			grounded_updates = _fetch_grounded_updates_with_gemini('en', 8)
			_store_grounded_press_updates(grounded_updates)
			items.extend([
				{
					'update_id': f"grounded:{update.get('url')}",
					'category': 'press_release',
					'title': update.get('title', ''),
				}
				for update in grounded_updates
			])
		except Exception:
			pass

	return bool(items)


def _query_farmer_update_db(request_data, max_items=12):
	location = request_data.get('location') or {}
	state = str(location.get('state') or request_data.get('state') or '').strip()
	district = str(location.get('district') or request_data.get('district') or '').strip()
	query_terms = [
		'farmer', 'agriculture', 'crop', 'kisan', 'mandi', 'msp', 'scheme',
		'subsidy', 'loan', 'bank', 'credit', 'procurement', 'fisheries',
	]
	if state:
		query_terms.append(state)
	if district:
		query_terms.append(district)

	relevance = Q()
	for term in query_terms:
		relevance |= Q(title__icontains=term) | Q(description__icontains=term) | Q(tags__icontains=term)

	location_q = Q()
	if state:
		location_q |= Q(state__iexact=state) | Q(state='')
	if district:
		location_q |= Q(district__iexact=district) | Q(district='')

	queryset = FarmerUpdate.objects.filter(relevance)
	if location_q:
		queryset = queryset.filter(location_q)

	category_order = ['press_release', 'mandi', 'scheme', 'loan']
	per_category = max(2, max_items // len(category_order))
	items = []
	for category in category_order:
		category_items = list(queryset.filter(category=category).order_by('-fetched_at', '-id')[:per_category])
		items.extend(category_items)

	if len(items) < max_items:
		existing_ids = [item.id for item in items]
		items.extend(
			queryset.exclude(id__in=existing_ids).order_by('-fetched_at', '-id')[:max_items - len(items)]
		)
	if len(items) < max_items:
		existing_ids = [item.id for item in items]
		items.extend(FarmerUpdate.objects.exclude(id__in=existing_ids).order_by('-fetched_at', '-id')[:max_items - len(items)])
	return items[:max_items]


def _farmer_updates_to_response(items):
	category_type = {
		'press_release': 'new',
		'scheme': 'new',
		'mandi': 'market',
		'loan': 'loan',
	}
	category_badge = {
		'press_release': 'PIB Release',
		'scheme': 'Scheme',
		'mandi': 'Mandi Price',
		'loan': 'Loan',
	}
	return [
		{
			'id': item.update_id,
			'title': item.title,
			'desc': item.description,
			'badge': category_badge.get(item.category, 'Update'),
			'date': item.published_at,
			'type': category_type.get(item.category, 'update'),
			'url': item.source_url,
			'sourceName': item.source_name,
		}
		for item in items
	]


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


def _store_grounded_press_updates(updates):
	for index, item in enumerate(updates):
		url = item.get('url') or ''
		title = item.get('title') or ''
		if not url or not title:
			continue
		_upsert_farmer_update({
			'update_id': f"grounded:{url}",
			'category': 'press_release' if item.get('type') != 'market' else 'mandi',
			'title': title,
			'description': item.get('desc', ''),
			'source_name': item.get('sourceName') or 'Official Government Source',
			'source_url': url,
			'published_at': item.get('date', ''),
			'tags': ['farmer', 'government', 'grounded-search'],
			'payload': item,
		})


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
		try:
			data = _extract_json_object(_generate_gemini_text(prompt))
			updates = data.get('updates', [])
			if isinstance(updates, list) and len(updates) > 0:
				return updates[:max_items]
		except Exception:
			pass

		fallback = []
		for item in source_updates[:max_items]:
			fallback.append({
				**item,
				'title': _translate_text_free(item.get('title', ''), language),
				'desc': _translate_text_free(item.get('desc', ''), language),
				'badge': _translate_text_free(item.get('badge', ''), language),
			})
		return fallback

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
			refreshed = _refresh_farmer_update_db_if_needed(request.data)
			db_items = _query_farmer_update_db(request.data, max_items)
			source_updates = _farmer_updates_to_response(db_items)
			if not source_updates:
				source_updates = _fetch_grounded_updates_with_gemini(language, max_items)
			try:
				updates = self._localize_home_updates(source_updates, language, max_items)
			except Exception:
				updates = source_updates[:max_items]
			payload = {
				'updates': updates,
				'source': 'verified-government-api',
				'lastFetched': timezone.now().isoformat(),
				'refreshAfterSeconds': cache_seconds,
				'refreshed': refreshed,
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
			context = request.data or {}
			location = context.get('location') or {}
			lat = location.get('lat') or location.get('latitude')
			lng = location.get('lng') or location.get('longitude')
			state = location.get('state') or context.get('state') or ''
			district = location.get('district') or context.get('district') or ''
			requested_amount = context.get('requestedAmount') or 200000
			max_items = int(context.get('maxItems') or 8)
			prompt = f"""
Return strict JSON only:
{{"offers":[{{"id":"","bankName":"","branch":"","loanType":"","annualInterestRate":0,"tenureMonths":0,"processingFeePercent":0,"minAmount":0,"maxAmount":0,"distanceKm":0,"documents":[],"address":"","contactPhone":"","managerName":"","website":"","workingHours":"","aiSummary":""}}]}}

Generate farmer loan options for nearby banks in India based on location and include loan-specific details, not generic placeholders.
Context:
- language: {language}
- state: {state}
- district: {district}
- latitude: {lat}
- longitude: {lng}
- requestedAmount: {requested_amount}
- audience: farmers
Rules:
- Provide distinct offers from different banks/schemes.
- Include realistic bank branch names and scheme-specific terms.
- aiSummary should explain why this offer differs from others.
- Keep documents list specific to the scheme.
- Return max {max_items} offers.
"""
			offers = _extract_json_object(_generate_gemini_text(prompt, tools=[{'google_search': {}}])).get('offers', [])
			if not isinstance(offers, list) or len(offers) == 0:
				raise ValueError('Gemini returned no nearby loan offers')
			return Response({'offers': offers[:max_items], 'source': 'gemini'})
		except Exception:
			try:
				loan_rows = LoanOption.objects.all()
				location = request.data.get('location') or {}
				state = str(location.get('state') or request.data.get('state') or '').lower()
				if state:
					loan_rows = [row for row in loan_rows if state in (row.address or '').lower() or state in (row.branch_name or '').lower()]
				else:
					loan_rows = list(loan_rows)
				offers = [
					{
						'id': row.loan_id,
						'bankName': row.bank_name,
						'branch': row.branch_name,
						'loanType': row.loan_type,
						'annualInterestRate': row.annual_interest_rate,
						'tenureMonths': row.tenure_months,
						'processingFeePercent': row.processing_fee_percent,
						'minAmount': row.min_amount,
						'maxAmount': row.max_amount,
						'distanceKm': 0,
						'documents': row.documents_required,
						'address': row.address or '',
						'contactPhone': row.contact_phone or '',
						'managerName': row.manager_name or '',
						'website': row.website or '',
						'workingHours': row.working_hours or '',
						'aiSummary': row.prepayment_policy or '',
					}
					for row in loan_rows[:8]
				]
				return Response({'offers': offers, 'source': 'database'})
			except Exception:
				return Response({'offers': [], 'source': 'mock'})

	@action(detail=False, methods=['post'])
	def tts(self, request):
		return Response({'audioUrl': None, 'duration': 0, 'source': 'browser'})


class VoiceLogViewSet(viewsets.ModelViewSet):
	queryset = VoiceLog.objects.all()
	serializer_class = VoiceLogSerializer
