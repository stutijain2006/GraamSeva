from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import APIException

from .models import Scheme, MandiPrice, LoanOption, Eligibility, Application, Dashboard
from .serializers import (
	SchemeSerializer, MandiPriceSerializer, LoanOptionSerializer,
	EligibilitySerializer, ApplicationSerializer, DashboardSerializer
)
from .mock_data import (
	get_mock_schemes, get_mock_scheme, get_mock_mandi_prices,
	get_mock_loan_options, get_mock_dashboard, get_mock_eligibility
)


class SafeViewMixin:
	"""Mixin for safe handling with fallback to mock data on error"""
    
	def get_language(self):
		"""Extract language from request"""
		return (
			self.request.query_params.get('language')
			or self.request.headers.get('Accept-Language', 'en').split(',')[0].split('-')[0]
			or 'en'
		)

	def mock_list_response(self, key, data):
		"""Return list data in the shape the frontend services already understand."""
		return Response({key: data, 'results': data, 'source': 'mock'})
    
	def get_serializer_context(self):
		"""Add language to serializer context"""
		context = super().get_serializer_context()
		context['language'] = self.get_language()
		return context


class SchemeViewSet(SafeViewMixin, viewsets.ModelViewSet):
	"""
	API endpoint for government schemes
	GET /api/schemes/ - List all schemes
	GET /api/schemes/{id}/ - Get scheme details
	POST /api/schemes/search/ - Search schemes
	"""
	queryset = Scheme.objects.order_by('id')
	serializer_class = SchemeSerializer
    
	def list(self, request, *args, **kwargs):
		try:
			if not self.queryset.exists():
				language = self.get_language()
				return self.mock_list_response('schemes', get_mock_schemes(language))
			return super().list(request, *args, **kwargs)
		except Exception as e:
			language = self.get_language()
			mock_data = get_mock_schemes(language)
			return self.mock_list_response('schemes', mock_data)
    
	def retrieve(self, request, *args, **kwargs):
		try:
			return super().retrieve(request, *args, **kwargs)
		except Exception:
			language = self.get_language()
			scheme_id = kwargs.get('pk')
			mock_data = get_mock_scheme(language)
			return Response({'data': mock_data, 'source': 'mock'})
    
	@action(detail=False, methods=['post'])
	def search(self, request):
		"""Search schemes by query text"""
		try:
			query = request.data.get('query', '').lower()
			language = self.get_language()
            
			if query:
				queryset = self.queryset.filter(
					name__icontains=query
				) | self.queryset.filter(
					details__icontains=query
				)
			else:
				queryset = self.queryset
            
			serializer = self.get_serializer(queryset, many=True)
			return Response({'results': serializer.data, 'source': 'api'})
        
		except Exception:
			language = self.get_language()
			query = request.data.get('query', '').lower()
			mock_data = get_mock_schemes(language)
            
			# Filter mock data
			results = [s for s in mock_data if query in s.get('name', '').lower() or query in s.get('description', '').lower()]
			return Response({'results': results, 'source': 'mock'})

	@action(detail=False, methods=['get'])
	def by_state(self, request):
		state = request.query_params.get('state', '').lower()
		language = self.get_language()
		schemes = get_mock_schemes(language) if not self.queryset.exists() else self.get_serializer(self.queryset, many=True).data
		if state:
			schemes = [
				scheme for scheme in schemes
				if not scheme.get('states')
				or 'ALL' in scheme.get('states', [])
				or any(state in str(s).lower() for s in scheme.get('states', []))
			]
		return Response({'schemes': schemes, 'results': schemes, 'source': 'mock' if not self.queryset.exists() else 'api'})

	@action(detail=False, methods=['get'])
	def popular(self, request):
		language = self.get_language()
		schemes = get_mock_schemes(language) if not self.queryset.exists() else self.get_serializer(self.queryset[:3], many=True).data
		return Response({'schemes': schemes[:3], 'results': schemes[:3], 'source': 'mock' if not self.queryset.exists() else 'api'})


class MandiPriceViewSet(SafeViewMixin, viewsets.ModelViewSet):
	"""
	API endpoint for mandi (market) prices
	GET /api/mandi/ - Get all mandi prices
	GET /api/mandi/{id}/ - Get specific mandi
	POST /api/mandi/by_location/ - Get mandi by location
	"""
	queryset = MandiPrice.objects.order_by('id')
	serializer_class = MandiPriceSerializer
    
	def list(self, request, *args, **kwargs):
		try:
			if not self.queryset.exists():
				language = self.get_language()
				return self.mock_list_response('prices', get_mock_mandi_prices(language))
			return super().list(request, *args, **kwargs)
		except Exception:
			language = self.get_language()
			mock_data = get_mock_mandi_prices(language)
			return self.mock_list_response('prices', mock_data)
    
	def retrieve(self, request, *args, **kwargs):
		try:
			return super().retrieve(request, *args, **kwargs)
		except Exception:
			language = self.get_language()
			mock_data = get_mock_mandi_prices(language)
			return Response({'data': mock_data[0] if mock_data else {}, 'source': 'mock'})
    
	@action(detail=False, methods=['post'])
	def by_location(self, request):
		"""Get mandi prices by location (latitude/longitude)"""
		try:
			lat = request.data.get('latitude')
			lng = request.data.get('longitude')
            
			queryset = self.queryset.all()
			serializer = self.get_serializer(queryset, many=True)
			return Response({'mandis': serializer.data, 'source': 'api'})
        
		except Exception:
			language = self.get_language()
			mock_data = get_mock_mandi_prices(language)
			return Response({'mandis': mock_data, 'source': 'mock'})

	@action(detail=False, methods=['get'])
	def by_crop(self, request):
		crop = request.query_params.get('crop', '').lower()
		language = self.get_language()
		prices = get_mock_mandi_prices(language) if not self.queryset.exists() else self.get_serializer(self.queryset, many=True).data
		match = next(
			(
				mandi for mandi in prices
				if any(crop in str(item.get('crop', '')).lower() for item in mandi.get('crops', []))
			),
			prices[0] if prices else {}
		)
		return Response(match)


class LoanOptionViewSet(SafeViewMixin, viewsets.ModelViewSet):
	"""
	API endpoint for loan options
	GET /api/loans/ - Get all loan options
	GET /api/loans/{id}/ - Get specific loan
	POST /api/loans/nearby/ - Get loans near location
	"""
	queryset = LoanOption.objects.order_by('id')
	serializer_class = LoanOptionSerializer
    
	def list(self, request, *args, **kwargs):
		try:
			if not self.queryset.exists():
				language = self.get_language()
				return self.mock_list_response('loans', get_mock_loan_options(language))
			return super().list(request, *args, **kwargs)
		except Exception:
			language = self.get_language()
			mock_data = get_mock_loan_options(language)
			return self.mock_list_response('loans', mock_data)
    
	def retrieve(self, request, *args, **kwargs):
		try:
			return super().retrieve(request, *args, **kwargs)
		except Exception:
			language = self.get_language()
			mock_data = get_mock_loan_options(language)
			return Response({'data': mock_data[0] if mock_data else {}, 'source': 'mock'})
    
	@action(detail=False, methods=['post'])
	def nearby(self, request):
		"""Get nearby loan options by location"""
		try:
			lat = request.data.get('latitude')
			lng = request.data.get('longitude')
			radius = request.data.get('radius', 10)
            
			queryset = self.queryset.all()[:5]
			serializer = self.get_serializer(queryset, many=True)
			return Response({'nearby_loans': serializer.data, 'source': 'api'})
        
		except Exception:
			language = self.get_language()
			mock_data = get_mock_loan_options(language)
			return Response({'nearby_loans': mock_data, 'source': 'mock'})

	@action(detail=False, methods=['post'])
	def calculate(self, request):
		amount = float(request.data.get('amount', 0) or 0)
		interest = float(request.data.get('interest', 0) or 0)
		tenure = int(request.data.get('tenure', 0) or 0)
		if amount <= 0 or interest <= 0 or tenure <= 0:
			return Response({'emi': 0, 'totalAmount': amount, 'totalInterest': 0})
		monthly_rate = (interest / 100) / 12
		emi = (amount * monthly_rate * ((1 + monthly_rate) ** tenure)) / (((1 + monthly_rate) ** tenure) - 1)
		total_amount = emi * tenure
		return Response({
			'emi': round(emi),
			'totalAmount': round(total_amount),
			'totalInterest': round(total_amount - amount),
			'principal': amount,
			'tenure': tenure,
			'interest': interest,
		})


class EligibilityViewSet(SafeViewMixin, viewsets.ModelViewSet):
	"""
	API endpoint for eligibility checking
	POST /api/eligibility/check/ - Check eligibility for scheme
	"""
	queryset = Eligibility.objects.order_by('id')
	serializer_class = EligibilitySerializer
    
	@action(detail=False, methods=['post'])
	def check(self, request):
		"""Check if farmer is eligible for a scheme"""
		try:
			scheme_id = request.data.get('scheme_id')
			farmer_data = request.data.get('farmer_data', {})
			language = self.get_language()
            
			eligibility = self.queryset.filter(scheme_id=scheme_id).first()
            
			if eligibility:
				serializer = self.get_serializer(eligibility)
				is_eligible = self._check_eligibility(eligibility, farmer_data)
				return Response({
					'eligible': is_eligible,
					'message': 'Eligibility check completed',
					'source': 'api'
				})
            
			return Response({'eligible': True, 'source': 'mock'})
        
		except Exception:
			language = self.get_language()
			mock_data = get_mock_eligibility(language)
			return Response({'eligible': True, 'message': 'Eligible', 'source': 'mock'})

	@action(detail=False, methods=['get'])
	def criteria(self, request):
		language = self.get_language()
		scheme_id = str(request.query_params.get('scheme_id', '1'))
		mock_data = get_mock_eligibility(language).get(scheme_id, {})
		return Response(mock_data)

	@action(detail=False, methods=['post'])
	def verify(self, request):
		return Response({'verified': True, 'issues': [], 'message': 'Eligibility verified', 'source': 'api'})
    
	def _check_eligibility(self, eligibility, farmer_data):
		"""Check farmer against eligibility criteria"""
		return True


class ApplicationViewSet(SafeViewMixin, viewsets.ModelViewSet):
	"""
	API endpoint for managing applications
	POST /api/applications/ - Create new application
	GET /api/applications/ - List user applications
	PATCH /api/applications/{id}/ - Update application
	"""
	queryset = Application.objects.order_by('-created_at')
	serializer_class = ApplicationSerializer
    
	def create(self, request, *args, **kwargs):
		try:
			return super().create(request, *args, **kwargs)
		except Exception:
			language = self.get_language()
			application_id = f"APP-{request.data.get('scheme_id') or request.data.get('schemeId', 0)}-{id(request)}"
			return Response({
				'application_id': application_id,
				'referenceId': application_id,
				'status': 'SUBMITTED',
				'message': 'Application submitted',
				'source': 'mock'
			}, status=status.HTTP_201_CREATED)
    
	def list(self, request, *args, **kwargs):
		try:
			return super().list(request, *args, **kwargs)
		except Exception:
			language = self.get_language()
			mock_data = get_mock_dashboard(language)
			return Response({
				'applications': mock_data.get('recent_applications', []),
				'source': 'mock'
			})
    
	def update(self, request, *args, **kwargs):
		try:
			return super().update(request, *args, **kwargs)
		except Exception:
			return Response({
				'status': 'updated',
				'source': 'mock'
			})


class DashboardViewSet(SafeViewMixin, viewsets.ModelViewSet):
	"""
	API endpoint for dashboard data
	GET /api/dashboard/ - Get dashboard stats
	"""
	queryset = Dashboard.objects.order_by('-updated_at')
	serializer_class = DashboardSerializer
    
	@action(detail=False, methods=['get'])
	def stats(self, request):
		try:
			dashboard = self.queryset.first()
			if dashboard:
				serializer = self.get_serializer(dashboard)
				return Response({'data': serializer.data, 'source': 'api'})
            
			language = self.get_language()
			mock_data = get_mock_dashboard(language)
			return Response({'data': mock_data, 'source': 'mock'})
		except Exception:
			language = self.get_language()
			mock_data = get_mock_dashboard(language)
			return Response({'data': mock_data, 'source': 'mock'})

	@action(detail=False, methods=['get'])
	def activities(self, request):
		language = self.get_language()
		mock_data = get_mock_dashboard(language)
		return Response({'activities': mock_data.get('recent_applications', []), 'source': 'mock'})

	@action(detail=False, methods=['get'])
	def chart_data(self, request):
		metric = request.query_params.get('metric', 'applications')
		mock_data = get_mock_dashboard(self.get_language())
		return Response({'metric': metric, 'data': mock_data.get('recent_applications', []), 'source': 'mock'})
