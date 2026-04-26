"""
Mock data for fallback on API errors
Matches frontend mock data exactly for consistency
"""

MOCK_SCHEMES = {
    'hi': [
        {
            'id': 1,
            'scheme_id': 1,
            'name': 'PM-KISAN',
            'icon': '🌾',
            'description': 'किसान सम्मान निधि योजना',
            'details': '₹6,000 वार्षिक आय सहायता',
            'government_level': 'CENTRAL',
            'states': ['ALL'],
            'benefits': ['हर 4 महीने में ₹2,000', 'सीधे बैंक में DBT ट्रांसफर', 'कोई बिचौलिया नहीं'],
            'how_to_apply': ['CSC केंद्र पर जाएं', 'आधार + जमीन के कागज जमा करें', 'जिला कार्यालय द्वारा सत्यापन', 'पैसे बैंक में आएंगे'],
            'documents': ['आधार कार्ड', 'जमीन के कागजात', 'बैंक खाता', 'मोबाइल नंबर'],
            'eligibility': {'gender': 'सभी', 'maritalStatus': 'सभी', 'incomeLimit': '₹10 लाख/वर्ष', 'landRequired': '≤ 2 हेक्टेयर'},
            'authority': {'ministry': 'कृषि मंत्रालय', 'stateBody': 'राज्य कृषि विभाग', 'localBody': 'ग्राम पंचायत'}
        },
        {
            'id': 2,
            'scheme_id': 2,
            'name': 'PM फसल बीमा योजना',
            'icon': '🛡️',
            'description': 'प्रधानमंत्री फसल बीमा योजना',
            'details': 'प्राकृतिक आपदाओं के विरुद्ध फसल बीमा',
            'government_level': 'CENTRAL_STATE',
            'states': ['ALL'],
            'benefits': ['फसल नुकसान पर बीमा कवर', 'कम प्रीमियम (1.5%–2%)', 'बाढ़, सूखा, कीटों से सुरक्षा', 'सीधे बैंक में दावा भुगतान'],
            'how_to_apply': ['नजदीकी बैंक या CSC केंद्र जाएं', 'फसल विवरण दर्ज कराएं', 'छोटा बीमा प्रीमियम दें', 'जमीन और आधार दस्तावेज जमा करें'],
            'documents': ['आधार कार्ड', 'जमीन / पट्टा दस्तावेज', 'बैंक खाते की जानकारी', 'फसल बोआई घोषणा'],
            'eligibility': {'gender': 'सभी', 'landRequired': 'खेती की जमीन आवश्यक'},
            'authority': {'ministry': 'कृषि मंत्रालय', 'stateBody': 'राज्य बीमा कार्यालय', 'localBody': 'जिला कृषि अधिकारी'}
        },
        {
            'id': 3,
            'scheme_id': 3,
            'name': 'किसान क्रेडिट कार्ड',
            'icon': '💳',
            'description': 'किसान क्रेडिट कार्ड — फसल खेती और संबंधित गतिविधियों के लिए',
            'details': 'कार्यशील पूंजी ऋण',
            'government_level': 'CENTRAL',
            'states': ['ALL'],
            'benefits': ['कम ब्याज दर पर फसल ऋण', 'समय पर भुगतान पर ब्याज छूट', 'डेयरी, मछली पालन, मुर्गीपालन के लिए भी', 'आसान नवीनीकरण'],
            'how_to_apply': ['नजदीकी बैंक शाखा जाएं', 'जमीन विवरण के साथ KCC फॉर्म जमा करें', 'KYC और क्षेत्र सत्यापन', 'स्वीकृत क्रेडिट सीमा प्राप्त करें'],
            'documents': ['आधार कार्ड', 'जमीन रिकॉर्ड / खेती का प्रमाण', 'बैंक KYC दस्तावेज', 'फोटो'],
            'eligibility': {'gender': 'सभी', 'landRequired': 'खेती की जमीन या पट्टे की जमीन'},
            'authority': {'ministry': 'कृषि मंत्रालय', 'stateBody': 'बैंक समिति', 'localBody': 'अनुसूचित वाणिज्यिक बैंक'}
        }
    ],
    'en': [
        {
            'id': 1,
            'scheme_id': 1,
            'name': 'PM-KISAN',
            'icon': '🌾',
            'description': 'Kisan Samman Nidhi Scheme',
            'details': '₹6,000 annual income support',
            'government_level': 'CENTRAL',
            'states': ['ALL'],
            'benefits': ['₹2,000 every 4 months', 'Direct DBT bank transfer', 'No middlemen'],
            'how_to_apply': ['Visit CSC center', 'Submit Aadhaar + land records', 'Verification by district office', 'Money credited to bank'],
            'documents': ['Aadhaar card', 'Land ownership papers', 'Bank account', 'Mobile number'],
            'eligibility': {'gender': 'All', 'maritalStatus': 'All', 'incomeLimit': '₹10 lakh/year', 'landRequired': '≤ 2 hectares'},
            'authority': {'ministry': 'Ministry of Agriculture', 'stateBody': 'State Agriculture Dept', 'localBody': 'Gram Panchayat'}
        }
    ]
}

MOCK_MANDI_PRICES = {
    'hi': [
        {
            'id': 1,
            'mandi_id': 1,
            'mandi_name': 'नई दिल्ली मंडी',
            'state': 'दिल्ली',
            'district': 'दिल्ली',
            'crops': [
                {'crop': 'गेहूं', 'price': 2500, 'unit': 'रुपये/क्विंटल', 'trend': 'stable'},
                {'crop': 'चावल', 'price': 4200, 'unit': 'रुपये/क्विंटल', 'trend': 'up'},
                {'crop': 'दाल', 'price': 6800, 'unit': 'रुपये/क्विंटल', 'trend': 'stable'},
                {'crop': 'मटर', 'price': 5200, 'unit': 'रुपये/क्विंटल', 'trend': 'down'}
            ],
            'last_updated': '2025-01-15T10:30:00Z'
        }
    ],
    'en': [
        {
            'id': 1,
            'mandi_id': 1,
            'mandi_name': 'Delhi Mandi',
            'state': 'Delhi',
            'district': 'Delhi',
            'crops': [
                {'crop': 'Wheat', 'price': 2500, 'unit': '₹/quintal', 'trend': 'stable'},
                {'crop': 'Rice', 'price': 4200, 'unit': '₹/quintal', 'trend': 'up'},
                {'crop': 'Pulses', 'price': 6800, 'unit': '₹/quintal', 'trend': 'stable'},
                {'crop': 'Peas', 'price': 5200, 'unit': '₹/quintal', 'trend': 'down'}
            ],
            'last_updated': '2025-01-15T10:30:00Z'
        }
    ]
}

MOCK_LOAN_OPTIONS = {
    'hi': [
        {
            'id': 'sbi-rural',
            'loan_id': 'sbi-rural',
            'bank_name': 'भारतीय स्टेट बैंक',
            'branch_name': 'ग्रामीण शाखा',
            'loan_type': 'AGRICULTURAL',
            'annual_interest_rate': 7.2,
            'tenure_months': 48,
            'processing_fee_percent': 1.0,
            'min_amount': 50000,
            'max_amount': 1200000,
            'prepayment_policy': '12 महीने के बाद अनुमति है',
            'documents': ['आधार कार्ड', 'PAN कार्ड', 'जमीन/आय प्रमाण', 'बैंक स्टेटमेंट (6 महीने)'],
            'address': 'मुख्य रोड शाखा',
            'contact_phone': '+91-00000-00001',
            'manager_name': 'लोन डेस्क',
            'working_hours': 'सोम-शनि 10:00 AM - 4:00 PM'
        }
    ],
    'en': [
        {
            'id': 'sbi-rural',
            'loan_id': 'sbi-rural',
            'bank_name': 'State Bank of India',
            'branch_name': 'Rural Branch',
            'loan_type': 'AGRICULTURAL',
            'annual_interest_rate': 7.2,
            'tenure_months': 48,
            'processing_fee_percent': 1.0,
            'min_amount': 50000,
            'max_amount': 1200000,
            'prepayment_policy': 'Allowed after 12 months',
            'documents': ['Aadhaar Card', 'PAN Card', 'Land/Income Proof', 'Bank Statement (6 months)'],
            'address': 'Main Road Branch',
            'contact_phone': '+91-00000-00001',
            'manager_name': 'Loan Desk',
            'working_hours': 'Mon-Sat 10:00 AM - 4:00 PM'
        }
    ]
}

MOCK_DASHBOARD = {
    'hi': {
        'dashboard_id': 'main',
        'total_schemes': 50,
        'trending_schemes': [1, 2, 3],
        'total_farmers_benefited': 15000000,
        'recent_applications': [
            {'application_id': 'APP001', 'farmer_name': 'राज कुमार', 'scheme_id': 1, 'status': 'APPROVED'},
            {'application_id': 'APP002', 'farmer_name': 'प्रिया सिंह', 'scheme_id': 2, 'status': 'SUBMITTED'}
        ],
        'featured_offers': [
            {'id': 1, 'title': 'नई PM-KISAN योजना', 'description': 'अब सभी किसान आवेदन कर सकते हैं'}
        ]
    },
    'en': {
        'dashboard_id': 'main',
        'total_schemes': 50,
        'trending_schemes': [1, 2, 3],
        'total_farmers_benefited': 15000000,
        'recent_applications': [
            {'application_id': 'APP001', 'farmer_name': 'Raj Kumar', 'scheme_id': 1, 'status': 'APPROVED'},
            {'application_id': 'APP002', 'farmer_name': 'Priya Singh', 'scheme_id': 2, 'status': 'SUBMITTED'}
        ],
        'featured_offers': [
            {'id': 1, 'title': 'New PM-KISAN Scheme', 'description': 'Now all farmers can apply'}
        ]
    }
}

MOCK_ELIGIBILITY = {
    'hi': {
        '1': {
            'scheme_id': 1,
            'eligible': True,
            'message': 'आप PM-KISAN के लिए पात्र हैं',
            'benefits': '₹6,000 वार्षिक'
        }
    },
    'en': {
        '1': {
            'scheme_id': 1,
            'eligible': True,
            'message': 'You are eligible for PM-KISAN',
            'benefits': '₹6,000 annual'
        }
    }
}


def get_mock_scheme(language='en'):
    """Get mock scheme for language"""
    schemes = MOCK_SCHEMES.get(language, MOCK_SCHEMES.get('en', []))
    return schemes[0] if schemes else {}


def get_mock_schemes(language='en'):
    """Get all mock schemes for language"""
    return MOCK_SCHEMES.get(language, MOCK_SCHEMES.get('en', []))


def get_mock_mandi_prices(language='en'):
    """Get mock mandi prices for language"""
    prices = MOCK_MANDI_PRICES.get(language, MOCK_MANDI_PRICES.get('en', []))
    return prices


def get_mock_loan_options(language='en'):
    """Get mock loan options for language"""
    loans = MOCK_LOAN_OPTIONS.get(language, MOCK_LOAN_OPTIONS.get('en', []))
    return loans


def get_mock_dashboard(language='en'):
    """Get mock dashboard data for language"""
    dashboard = MOCK_DASHBOARD.get(language, MOCK_DASHBOARD.get('en', {}))
    return dashboard


def get_mock_eligibility(language='en'):
    """Get mock eligibility data for language"""
    eligibility = MOCK_ELIGIBILITY.get(language, MOCK_ELIGIBILITY.get('en', {}))
    return eligibility
