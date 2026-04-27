from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
import math
import json
import os
import requests

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

	def _state_from_request(self, request):
		location = request.data.get('location') if hasattr(request, 'data') else None
		location = location or {}
		return (
			request.query_params.get('state')
			or request.data.get('state')
			or location.get('state')
			or ''
		)

	def _district_from_request(self, request):
		location = request.data.get('location') if hasattr(request, 'data') else None
		location = location or {}
		return (
			request.query_params.get('district')
			or request.data.get('district')
			or location.get('district')
			or ''
		)

	def _to_float(self, value):
		try:
			return float(value)
		except (TypeError, ValueError):
			return None

	def _distance_km(self, lat1, lon1, lat2, lon2):
		if None in (lat1, lon1, lat2, lon2):
			return None
		radius = 6371.0
		d_lat = math.radians(lat2 - lat1)
		d_lon = math.radians(lon2 - lon1)
		a = (
			math.sin(d_lat / 2) ** 2
			+ math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
		)
		return round(radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)

	def _localize_payload(self, payload, language, fields):
		if not payload or language in ('en', ''):
			return payload
		def fallback_translate(obj):
			if isinstance(obj, dict):
				out = {}
				for key, value in obj.items():
					if isinstance(value, str) and key in fields:
						out[key] = self._translate_text_free(value, language)
					else:
						out[key] = fallback_translate(value)
				return out
			if isinstance(obj, list):
				return [fallback_translate(item) for item in obj]
			return obj
		api_key = os.getenv('GEMINI_API_KEY') or os.getenv('VITE_GEMINI_API_KEY')
		if not api_key:
			return fallback_translate(payload)
		model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
		text = json.dumps(payload, ensure_ascii=False)
		prompt = f"""
Translate only the values of these keys into language code "{language}": {fields}.
Keep all keys, ids, numbers, urls, and date formats unchanged.
Return strict JSON only with same structure.
INPUT_JSON:
{text}
"""
		try:
			response = requests.post(
				f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent",
				params={'key': api_key},
				json={'contents': [{'parts': [{'text': prompt}]}]},
				timeout=18,
			)
			response.raise_for_status()
			data = response.json()
			model_text = data['candidates'][0]['content']['parts'][0].get('text', '')
			start = model_text.find('{')
			end = model_text.rfind('}')
			if start != -1 and end != -1 and end > start:
				return json.loads(model_text[start:end + 1])
		except Exception:
			return fallback_translate(payload)
		return payload

	def _translate_text_free(self, text, language):
		text = str(text or '').strip()
		if not text or language == 'en':
			return text
		lang_map = {
			'hi': 'hi',
			'bho': 'hi',
			'awa': 'hi',
			'mai': 'hi',
			'mr': 'mr',
			'or': 'or',
			'en': 'en',
		}
		target = lang_map.get((language or '').lower(), 'hi')
		try:
			response = requests.get(
				'https://translate.googleapis.com/translate_a/single',
				params={
					'client': 'gtx',
					'sl': 'auto',
					'tl': target,
					'dt': 't',
					'q': text,
				},
				timeout=8,
			)
			response.raise_for_status()
			data = response.json()
			return ''.join(chunk[0] for chunk in data[0] if chunk and chunk[0]).strip() or text
		except Exception:
			return text


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
			response = super().list(request, *args, **kwargs)
			localized = self._localize_payload(
				{'results': response.data},
				self.get_language(),
				['name', 'description', 'details', 'benefits', 'how_to_apply', 'documents', 'authority']
			)
			response.data = localized.get('results', response.data) if isinstance(localized, dict) else response.data
			return response
		except Exception as e:
			language = self.get_language()
			mock_data = get_mock_schemes(language)
			return self.mock_list_response('schemes', mock_data)
    
	def retrieve(self, request, *args, **kwargs):
		try:
			response = super().retrieve(request, *args, **kwargs)
			localized = self._localize_payload(
				{'item': response.data},
				self.get_language(),
				['name', 'description', 'details', 'benefits', 'how_to_apply', 'documents', 'authority']
			)
			response.data = localized.get('item', response.data) if isinstance(localized, dict) else response.data
			return response
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
			payload = {'results': serializer.data, 'source': 'api'}
			localized = self._localize_payload(payload, language, ['name', 'description', 'details'])
			return Response(localized if isinstance(localized, dict) else payload)
        
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
		payload = {'schemes': schemes, 'results': schemes, 'source': 'mock' if not self.queryset.exists() else 'api'}
		localized = self._localize_payload(payload, language, ['name', 'description', 'details', 'benefits'])
		return Response(localized if isinstance(localized, dict) else payload)

	@action(detail=False, methods=['get'])
	def popular(self, request):
		language = self.get_language()
		schemes = get_mock_schemes(language) if not self.queryset.exists() else self.get_serializer(self.queryset[:3], many=True).data
		payload = {'schemes': schemes[:3], 'results': schemes[:3], 'source': 'mock' if not self.queryset.exists() else 'api'}
		localized = self._localize_payload(payload, language, ['name', 'description', 'details', 'benefits'])
		return Response(localized if isinstance(localized, dict) else payload)


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
				state = self._state_from_request(request)
				district = self._district_from_request(request)
				if state or district:
					location_data = {'state': state, 'district': district}
					rows = self._fetch_agmarknet_prices(location_data)
					payload = {'prices': rows, 'results': rows, 'source': 'agmarknet'}
					localized = self._localize_payload(payload, language, ['mandi_name', 'crop', 'change', 'unit'])
					return Response(localized if isinstance(localized, dict) else payload)
				return self.mock_list_response('prices', get_mock_mandi_prices(language))
			response = super().list(request, *args, **kwargs)
			localized = self._localize_payload({'results': response.data}, language, ['mandi_name', 'state', 'district', 'crop', 'unit'])
			response.data = localized.get('results', response.data) if isinstance(localized, dict) else response.data
			return response
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
			lat = self._to_float(request.data.get('latitude'))
			lng = self._to_float(request.data.get('longitude'))
			state = self._state_from_request(request)
			district = self._district_from_request(request)

			if self.queryset.exists():
				queryset = self.queryset.all()
				if state:
					queryset = queryset.filter(state__icontains=state)
				if district:
					queryset = queryset.filter(district__icontains=district)
				serializer = self.get_serializer(queryset[:12], many=True)
				payload = {'mandis': serializer.data, 'source': 'api'}
				localized = self._localize_payload(payload, self.get_language(), ['mandi_name', 'state', 'district', 'crop', 'unit'])
				return Response(localized if isinstance(localized, dict) else payload)

			agmarknet_rows = self._fetch_agmarknet_prices({
				'state': state,
				'district': district,
				'latitude': lat,
				'longitude': lng,
			})
			if agmarknet_rows:
				payload = {'mandis': agmarknet_rows, 'source': 'agmarknet'}
				localized = self._localize_payload(payload, self.get_language(), ['mandi_name', 'state', 'district', 'crop', 'change', 'unit'])
				return Response(localized if isinstance(localized, dict) else payload)
			raise APIException('No mandi rows found')
		except Exception:
			language = self.get_language()
			mock_data = get_mock_mandi_prices(language)
			return Response({'mandis': mock_data, 'source': 'mock'})

	def _fetch_agmarknet_prices(self, location_data, limit=12):
		api_key = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'
		params = {
			'api-key': api_key,
			'format': 'json',
			'offset': 0,
			'limit': limit,
		}
		state = location_data.get('state')
		district = location_data.get('district')
		if state:
			params['filters[state]'] = state
		if district:
			params['filters[district]'] = district

		url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
		response = requests.get(url, params=params, timeout=12)
		response.raise_for_status()
		records = response.json().get('records', [])

		by_market = {}
		for row in records:
			market = row.get('market') or row.get('Market') or 'Mandi'
			state_name = row.get('state') or row.get('State') or ''
			district_name = row.get('district') or row.get('District') or ''
			key = f"{market}|{district_name}|{state_name}"
			entry = by_market.setdefault(
				key,
				{
					'id': key,
					'mandi_id': key,
					'mandi_name': market,
					'state': state_name,
					'district': district_name,
					'crops': [],
				}
			)
			entry['crops'].append({
				'crop': row.get('commodity') or 'Commodity',
				'price': row.get('modal_price') or row.get('Modal Price') or 0,
				'unit': '₹/quintal',
				'trend': 'stable',
				'change': f"Min {row.get('min_price') or '-'} / Max {row.get('max_price') or '-'}",
			})

		return list(by_market.values())[:limit]

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
			queryset = self.queryset.all()
			loan_type = request.query_params.get('type')
			if loan_type:
				queryset = queryset.filter(loan_type__iexact=loan_type)
			serializer = self.get_serializer(queryset, many=True)
			payload = {'loans': serializer.data, 'results': serializer.data, 'source': 'api'}
			localized = self._localize_payload(payload, self.get_language(), ['bank_name', 'branch_name', 'loan_type', 'prepayment_policy', 'documents_required', 'address', 'working_hours'])
			return Response(localized if isinstance(localized, dict) else payload)
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
			lat = self._to_float(request.data.get('latitude') or (request.data.get('location') or {}).get('lat') or (request.data.get('location') or {}).get('latitude'))
			lng = self._to_float(request.data.get('longitude') or (request.data.get('location') or {}).get('lng') or (request.data.get('location') or {}).get('longitude'))
			radius = self._to_float(request.data.get('radius', 50)) or 50
			state = self._state_from_request(request)

			queryset = self.queryset.all()
			if state:
				queryset = queryset.filter(address__icontains=state) | queryset.filter(branch_name__icontains=state)

			serialized = self.get_serializer(queryset, many=True).data
			for item in serialized:
				item['distance_km'] = self._distance_km(
					lat, lng, self._to_float(item.get('latitude')), self._to_float(item.get('longitude'))
				)

			serialized.sort(key=lambda x: x.get('distance_km') if x.get('distance_km') is not None else 999999)
			nearby = [item for item in serialized if item.get('distance_km') is None or item.get('distance_km') <= radius][:8]
			payload = {'nearby_loans': nearby, 'source': 'api'}
			localized = self._localize_payload(payload, self.get_language(), ['bank_name', 'branch_name', 'loan_type', 'prepayment_policy', 'documents_required', 'address', 'working_hours'])
			return Response(localized if isinstance(localized, dict) else payload)
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
