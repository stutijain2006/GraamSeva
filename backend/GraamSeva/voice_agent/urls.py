from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    VoiceConversationViewSet, VoiceTranscriptViewSet,
    VoiceAgentViewSet, VoiceLogViewSet
)

router = SimpleRouter()
router.register(r'conversations', VoiceConversationViewSet, basename='conversation')
router.register(r'transcripts', VoiceTranscriptViewSet, basename='transcript')
router.register(r'agent', VoiceAgentViewSet, basename='agent')
router.register(r'logs', VoiceLogViewSet, basename='log')

app_name = 'voice_agent'

urlpatterns = [
    path('', include(router.urls)),
]
