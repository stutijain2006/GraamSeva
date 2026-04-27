from django.db import models
from django.db.models import JSONField


class Scheme(models.Model):
	"""Government scheme model with multi-language support"""
	GOVERNMENT_LEVEL_CHOICES = [
		('CENTRAL', 'Central Government'),
		('STATE', 'State Government'),
		('CENTRAL_STATE', 'Central + State Government'),
	]
    
	scheme_id = models.IntegerField(unique=True, db_index=True)
	name = models.CharField(max_length=255)
	icon = models.CharField(max_length=10, default='🌾')
	details = models.TextField()
	government_level = models.CharField(max_length=20, choices=GOVERNMENT_LEVEL_CHOICES)
	states = JSONField(default=list)
    
	# Multi-language content
	descriptions = JSONField(default=dict)  # {lang: description}
	benefits = JSONField(default=dict)  # {lang: [benefits]}
	how_to_apply = JSONField(default=dict)  # {lang: [steps]}
	documents_required = JSONField(default=dict)  # {lang: [documents]}
    
	# Eligibility
	eligibility = JSONField(default=dict)
	authority = JSONField(default=dict)
    
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
    
	class Meta:
		db_table = 'data_scheme'
		verbose_name = 'Scheme'
		verbose_name_plural = 'Schemes'
    
	def __str__(self):
		return f"{self.name} ({self.scheme_id})"


class MandiPrice(models.Model):
	"""Mandi (market) prices for various crops"""
	mandi_id = models.IntegerField(unique=True, db_index=True)
	mandi_name = models.CharField(max_length=255)
	state = models.CharField(max_length=50)
	district = models.CharField(max_length=255)
    
	crops = JSONField(default=list)  # [{crop: name, price: float, unit: kg/quintal, trend: up/down/stable}]
	last_updated = models.DateTimeField(auto_now=True)
    
	class Meta:
		db_table = 'data_mandi_price'
    
	def __str__(self):
		return f"{self.mandi_name} ({self.state})"


class LoanOption(models.Model):
	"""Bank loan options for farmers"""
	LOAN_TYPE_CHOICES = [
		('AGRICULTURAL', 'Agricultural Loan'),
		('KISAN_CREDIT', 'Kisan Credit Card'),
		('TRACTOR', 'Tractor Loan'),
		('EQUIPMENT', 'Equipment Loan'),
	]
    
	loan_id = models.CharField(max_length=50, unique=True, db_index=True)
	bank_name = models.CharField(max_length=255)
	branch_name = models.CharField(max_length=255)
	loan_type = models.CharField(max_length=20, choices=LOAN_TYPE_CHOICES)
    
	annual_interest_rate = models.FloatField()
	tenure_months = models.IntegerField()
	processing_fee_percent = models.FloatField()
	min_amount = models.IntegerField()
	max_amount = models.IntegerField()
    
	prepayment_policy = models.TextField()
	documents_required = JSONField(default=list)
    
	address = models.CharField(max_length=500, null=True, blank=True)
	contact_phone = models.CharField(max_length=20, null=True, blank=True)
	manager_name = models.CharField(max_length=255, null=True, blank=True)
	website = models.URLField(null=True, blank=True)
	working_hours = models.CharField(max_length=255, null=True, blank=True)
    
	latitude = models.FloatField(null=True, blank=True)
	longitude = models.FloatField(null=True, blank=True)
    
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
    
	class Meta:
		db_table = 'data_loan_option'
    
	def __str__(self):
		return f"{self.bank_name} - {self.branch_name}"


class Eligibility(models.Model):
	"""Farmer eligibility checker model"""
	eligibility_id = models.CharField(max_length=50, unique=True, db_index=True)
	scheme_id = models.IntegerField()
    
	# Rules stored as JSON for flexibility
	criteria = JSONField(default=dict)  # {field: condition}
	min_land_size = models.FloatField(null=True, blank=True)
	max_land_size = models.FloatField(null=True, blank=True)
	max_annual_income = models.IntegerField(null=True, blank=True)
    
	eligible_states = JSONField(default=list)
	eligible_genders = JSONField(default=list)
    
	created_at = models.DateTimeField(auto_now_add=True)
    
	class Meta:
		db_table = 'data_eligibility'
    
	def __str__(self):
		return f"Eligibility - Scheme {self.scheme_id}"


class Application(models.Model):
	"""Track farmer applications"""
	STATUS_CHOICES = [
		('DRAFT', 'Draft'),
		('SUBMITTED', 'Submitted'),
		('UNDER_REVIEW', 'Under Review'),
		('APPROVED', 'Approved'),
		('REJECTED', 'Rejected'),
		('WITHDRAWN', 'Withdrawn'),
	]
    
	application_id = models.CharField(max_length=50, unique=True, db_index=True)
	scheme_id = models.IntegerField()
	farmer_name = models.CharField(max_length=255)
	farmer_phone = models.CharField(max_length=20)
	farmer_aadhar = models.CharField(max_length=12, null=True, blank=True)
    
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
	application_data = JSONField(default=dict)
    
	submitted_at = models.DateTimeField(null=True, blank=True)
	reviewed_at = models.DateTimeField(null=True, blank=True)
    
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
    
	class Meta:
		db_table = 'data_application'
    
	def __str__(self):
		return f"App {self.application_id}"


class Dashboard(models.Model):
	"""Dashboard statistics and data"""
	dashboard_id = models.CharField(max_length=50, unique=True, db_index=True)
    
	total_schemes = models.IntegerField(default=0)
	trending_schemes = JSONField(default=list)
    
	total_farmers_benefited = models.IntegerField(default=0)
	recent_applications = JSONField(default=list)
    
	featured_offers = JSONField(default=list)
    
	updated_at = models.DateTimeField(auto_now=True)
    
	class Meta:
		db_table = 'data_dashboard'
    
	def __str__(self):
		return f"Dashboard {self.dashboard_id}"


class FarmerUpdate(models.Model):
	"""Daily-ingested farmer updates searched by Home and assistant flows."""
	CATEGORY_CHOICES = [
		('press_release', 'Press Release'),
		('scheme', 'Government Scheme'),
		('mandi', 'Mandi Price'),
		('loan', 'Loan Option'),
	]

	update_id = models.CharField(max_length=180, unique=True, db_index=True)
	category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, db_index=True)
	title = models.CharField(max_length=500)
	description = models.TextField(blank=True)
	source_name = models.CharField(max_length=255)
	source_url = models.URLField(max_length=1000, blank=True)
	published_at = models.CharField(max_length=120, blank=True)
	state = models.CharField(max_length=100, blank=True, db_index=True)
	district = models.CharField(max_length=150, blank=True, db_index=True)
	tags = JSONField(default=list)
	payload = JSONField(default=dict)
	fetched_at = models.DateTimeField(auto_now=True, db_index=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'data_farmer_update'
		ordering = ['-fetched_at', '-id']

	def __str__(self):
		return f"{self.category}: {self.title}"
