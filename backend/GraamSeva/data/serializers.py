from rest_framework import serializers
from .models import Scheme, MandiPrice, LoanOption, Eligibility, Application, Dashboard


class SchemeSerializer(serializers.ModelSerializer):
    # For API responses, include localized content
    description = serializers.SerializerMethodField()
    benefits = serializers.SerializerMethodField()
    how_to_apply = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    
    def get_description(self, obj):
        lang = self.context.get('language', 'en')
        return obj.descriptions.get(lang, obj.details)
    
    def get_benefits(self, obj):
        lang = self.context.get('language', 'en')
        return obj.benefits.get(lang, [])
    
    def get_how_to_apply(self, obj):
        lang = self.context.get('language', 'en')
        return obj.how_to_apply.get(lang, [])
    
    def get_documents(self, obj):
        lang = self.context.get('language', 'en')
        return obj.documents_required.get(lang, [])
    
    class Meta:
        model = Scheme
        fields = [
            'id', 'scheme_id', 'name', 'icon', 'description', 'benefits',
            'government_level', 'states', 'how_to_apply', 'documents',
            'eligibility', 'authority'
        ]


class MandiPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MandiPrice
        fields = [
            'id', 'mandi_id', 'mandi_name', 'state', 'district',
            'crops', 'last_updated'
        ]


class LoanOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanOption
        fields = [
            'id', 'loan_id', 'bank_name', 'branch_name', 'loan_type',
            'annual_interest_rate', 'tenure_months', 'processing_fee_percent',
            'min_amount', 'max_amount', 'prepayment_policy',
            'documents_required', 'address', 'contact_phone', 'manager_name',
            'website', 'working_hours', 'latitude', 'longitude'
        ]


class EligibilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Eligibility
        fields = [
            'id', 'eligibility_id', 'scheme_id', 'criteria',
            'min_land_size', 'max_land_size', 'max_annual_income',
            'eligible_states', 'eligible_genders'
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'id', 'application_id', 'scheme_id', 'farmer_name',
            'farmer_phone', 'farmer_aadhar', 'status',
            'application_data', 'submitted_at', 'reviewed_at',
            'created_at', 'updated_at'
        ]


class DashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dashboard
        fields = [
            'id', 'dashboard_id', 'total_schemes', 'trending_schemes',
            'total_farmers_benefited', 'recent_applications',
            'featured_offers', 'updated_at'
        ]
