from django.db import models
from django.db.models import JSONField


class VoiceConversation(models.Model):
	"""Track voice interactions with the AI agent"""
	conversation_id = models.CharField(max_length=50, unique=True, db_index=True)
	farmer_phone = models.CharField(max_length=20, null=True, blank=True)
	farmer_name = models.CharField(max_length=255, null=True, blank=True)
    
	# Conversation metadata
	language = models.CharField(max_length=10, default='en')
	session_start = models.DateTimeField(auto_now_add=True)
	session_end = models.DateTimeField(null=True, blank=True)
    
	# Messages in conversation
	messages = JSONField(default=list)  # [{role: 'user'|'agent', text: transcript, timestamp: ISO}]
	context = JSONField(default=dict)  # User profile, location, preferences
    
	# Results/Outcomes
	final_response = JSONField(null=True, blank=True)
	outcomes = JSONField(default=list)  # [application_id, scheme_id, etc]
    
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
    
	class Meta:
		db_table = 'voice_agent_conversation'
    
	def __str__(self):
		return f"Conversation {self.conversation_id}"


class VoiceTranscript(models.Model):
	"""Individual voice transcripts with translations"""
	transcript_id = models.CharField(max_length=50, unique=True, db_index=True)
	conversation = models.ForeignKey(VoiceConversation, on_delete=models.CASCADE, related_name='transcripts')
    
	# Audio info
	role = models.CharField(max_length=10, choices=[('user', 'User'), ('agent', 'Agent')])
	language = models.CharField(max_length=10)
    
	# Text content
	original_text = models.TextField()  # Original transcribed text
	translated_text = models.TextField(null=True, blank=True)  # English translation
	confidence = models.FloatField(default=0.9)  # Speech recognition confidence
    
	# Processing
	ai_response = JSONField(null=True, blank=True)  # Structured AI response
	processed_at = models.DateTimeField(null=True, blank=True)
    
	timestamp = models.DateTimeField(auto_now_add=True)
    
	class Meta:
		db_table = 'voice_agent_transcript'
    
	def __str__(self):
		return f"Transcript {self.transcript_id}"


class VoiceAgentResponse(models.Model):
	"""AI agent responses with structured data"""
	response_id = models.CharField(max_length=50, unique=True, db_index=True)
	conversation = models.ForeignKey(VoiceConversation, on_delete=models.CASCADE, related_name='responses')
    
	# Response content
	message = models.TextField()  # Main response text
	speak = models.TextField()  # Spoken summary (shorter, conversational)
    
	# Navigation
	redirect_page = models.CharField(max_length=50, null=True, blank=True)  # home, schemes, loan, etc
    
	# Structured data
	result_items = JSONField(default=list)  # [{label: value, detail: description}]
    
	# Metadata
	language = models.CharField(max_length=10)
	confidence = models.FloatField(default=0.9)
    
	timestamp = models.DateTimeField(auto_now_add=True)
    
	class Meta:
		db_table = 'voice_agent_response'
    
	def __str__(self):
		return f"Response {self.response_id}"


class VoiceLog(models.Model):
	"""Logging for debugging and analytics"""
	log_id = models.CharField(max_length=50, unique=True, db_index=True)
	conversation = models.ForeignKey(VoiceConversation, on_delete=models.CASCADE, related_name='logs', null=True, blank=True)
    
	# Log info
	level = models.CharField(max_length=20, choices=[('INFO', 'Info'), ('DEBUG', 'Debug'), ('ERROR', 'Error'), ('WARNING', 'Warning')])
	event = models.CharField(max_length=255)
	description = models.TextField(null=True, blank=True)
    
	# Context
	metadata = JSONField(default=dict)
    
	timestamp = models.DateTimeField(auto_now_add=True)
    
	class Meta:
		db_table = 'voice_agent_log'
    
	def __str__(self):
		return f"Log {self.level}: {self.event}"
