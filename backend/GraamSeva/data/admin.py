from django.contrib import admin
from .models import Scheme, MandiPrice, LoanOption, Eligibility, Application, Dashboard


@admin.register(Scheme)
class SchemeAdmin(admin.ModelAdmin):
	list_display = ('name', 'scheme_id', 'government_level', 'created_at')
	search_fields = ('name', 'scheme_id')
	list_filter = ('government_level', 'created_at')


@admin.register(MandiPrice)
class MandiPriceAdmin(admin.ModelAdmin):
	list_display = ('mandi_name', 'state', 'district', 'last_updated')
	search_fields = ('mandi_name', 'state')
	list_filter = ('state', 'last_updated')


@admin.register(LoanOption)
class LoanOptionAdmin(admin.ModelAdmin):
	list_display = ('bank_name', 'branch_name', 'loan_type', 'annual_interest_rate')
	search_fields = ('bank_name', 'branch_name', 'loan_id')
	list_filter = ('loan_type', 'annual_interest_rate')


@admin.register(Eligibility)
class EligibilityAdmin(admin.ModelAdmin):
	list_display = ('scheme_id', 'eligibility_id', 'created_at')
	search_fields = ('scheme_id', 'eligibility_id')
	list_filter = ('created_at',)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
	list_display = ('farmer_name', 'scheme_id', 'status', 'submitted_at')
	search_fields = ('farmer_name', 'farmer_phone', 'application_id')
	list_filter = ('status', 'submitted_at')


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
	list_display = ('dashboard_id', 'total_schemes', 'total_farmers_benefited', 'updated_at')
	list_filter = ('updated_at',)
