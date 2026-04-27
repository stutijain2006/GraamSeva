from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
import json
import os
import uuid

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
	def _generate_with_gemini(self, query, language='en', context=None):
		api_key = _gemini_api_key()
		if not api_key:
			raise RuntimeError('Gemini API key is not configured')

		import google.generativeai as genai

		context = context or {}
		profile = context.get('profile') or {}
		location = context.get('location') or {}
		model_name = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')

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

		genai.configure(api_key=api_key)
		model = genai.GenerativeModel(model_name, system_instruction=system_instruction)
		response = model.generate_content(
			prompt,
			generation_config={'response_mime_type': 'application/json'},
		)
		return _extract_json_object(response.text or '')

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
		try:
			query = 'Recent government schemes, subsidies, policy updates and offers for Indian farmers'
			ai_response = self._generate_with_gemini(query, language, request.data)
			items = ai_response.get('result', {}).get('items', [])
			updates = [
				{
					'id': f'update-{index + 1}',
					'title': item.get('Label') or item.get('title') or item.get('Scheme') or 'Government Update',
					'desc': item.get('Detail') or item.get('description') or item.get('Value') or '',
					'badge': item.get('Badge') or item.get('Category') or 'Update',
					'type': 'scheme',
				}
				for index, item in enumerate(items)
			]
			return Response({'updates': updates, 'source': 'gemini'})
		except Exception:
			return Response({'updates': [], 'source': 'mock'})

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
