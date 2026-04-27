from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    SchemeViewSet, MandiPriceViewSet, LoanOptionViewSet,
    EligibilityViewSet, ApplicationViewSet, DashboardViewSet
)

# Create router and register viewsets
router = SimpleRouter()
router.register(r'schemes', SchemeViewSet, basename='scheme')
router.register(r'mandi', MandiPriceViewSet, basename='mandi')
router.register(r'loans', LoanOptionViewSet, basename='loan')
router.register(r'eligibility', EligibilityViewSet, basename='eligibility')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

app_name = 'data'

urlpatterns = [
    path('', include(router.urls)),
]
