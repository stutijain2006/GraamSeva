from rest_framework import serializers
from .models import VoiceConversation, VoiceTranscript, VoiceAgentResponse, VoiceLog


class VoiceTranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceTranscript
        fields = [
            'id', 'transcript_id', 'role', 'language', 'original_text',
            'translated_text', 'confidence', 'ai_response', 'timestamp'
        ]


class VoiceAgentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceAgentResponse
        fields = [
            'id', 'response_id', 'message', 'speak', 'redirect_page',
            'result_items', 'language', 'confidence', 'timestamp'
        ]


class VoiceConversationSerializer(serializers.ModelSerializer):
    transcripts = VoiceTranscriptSerializer(many=True, read_only=True)
    responses = VoiceAgentResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = VoiceConversation
        fields = [
            'id', 'conversation_id', 'farmer_phone', 'farmer_name',
            'language', 'session_start', 'session_end', 'messages',
            'context', 'final_response', 'outcomes', 'transcripts',
            'responses', 'created_at', 'updated_at'
        ]


class VoiceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceLog
        fields = [
            'id', 'log_id', 'level', 'event', 'description',
            'metadata', 'timestamp'
        ]
