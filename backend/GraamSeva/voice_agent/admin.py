from django.contrib import admin
from .models import VoiceConversation, VoiceTranscript, VoiceAgentResponse, VoiceLog


@admin.register(VoiceConversation)
class VoiceConversationAdmin(admin.ModelAdmin):
	list_display = ('conversation_id', 'farmer_name', 'farmer_phone', 'language', 'session_start')
	search_fields = ('conversation_id', 'farmer_name', 'farmer_phone')
	list_filter = ('language', 'session_start')
	readonly_fields = ('conversation_id', 'session_start', 'created_at', 'updated_at')


@admin.register(VoiceTranscript)
class VoiceTranscriptAdmin(admin.ModelAdmin):
	list_display = ('transcript_id', 'conversation', 'role', 'language', 'confidence', 'timestamp')
	search_fields = ('transcript_id', 'original_text')
	list_filter = ('role', 'language', 'timestamp')
	readonly_fields = ('transcript_id', 'timestamp')


@admin.register(VoiceAgentResponse)
class VoiceAgentResponseAdmin(admin.ModelAdmin):
	list_display = ('response_id', 'conversation', 'redirect_page', 'language', 'timestamp')
	search_fields = ('response_id', 'message')
	list_filter = ('language', 'redirect_page', 'timestamp')
	readonly_fields = ('response_id', 'timestamp')


@admin.register(VoiceLog)
class VoiceLogAdmin(admin.ModelAdmin):
	list_display = ('log_id', 'level', 'event', 'timestamp')
	search_fields = ('log_id', 'event', 'description')
	list_filter = ('level', 'timestamp')
	readonly_fields = ('log_id', 'timestamp')
