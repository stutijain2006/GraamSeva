from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
import uuid

from .models import VoiceConversation, VoiceTranscript, VoiceAgentResponse, VoiceLog
from .serializers import VoiceConversationSerializer, VoiceTranscriptSerializer, VoiceAgentResponseSerializer, VoiceLogSerializer
from .mock_responses import get_mock_response


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
	@action(detail=False, methods=['post'])
	def chat(self, request):
		try:
			query = request.data.get('query', '')
			language = request.data.get('language', 'en')
			response_id = str(uuid.uuid4())[:12]
			ai_response = get_mock_response(query, language)
			return Response({**ai_response, 'response_id': response_id})
		except Exception:
			language = request.data.get('language', 'en')
			return Response(get_mock_response('', language))


class VoiceLogViewSet(viewsets.ModelViewSet):
	queryset = VoiceLog.objects.all()
	serializer_class = VoiceLogSerializer
