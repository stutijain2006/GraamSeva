"""
Mock voice agent responses for fallback
"""

MOCK_VOICE_RESPONSES = {
    'hi': {
        'loan': {
            'message': 'आपके बजट के अनुसार, आप पास के बैंकों जैसे SBI या बैंक ऑफ महाराष्ट्र से ट्रैक्टर लोन के लिए पात्र हैं। मैं आपको लोन पेज पर ले जा रहा हूँ जहाँ आप ब्याज दरों की तुलना कर सकते हैं।',
            'speak': 'लोन के विकल्पों की जानकारी के लिए मैं आपको लोन पेज पर भेज रहा हूँ।',
            'redirect': 'loan',
            'result': {
                'items': [
                    {'बैंक': 'SBI नागपुर', 'ऑफर': 'कम ब्याज दर', 'दूरी': '2.5 km'},
                    {'बैंक': 'बैंक ऑफ महाराष्ट्र', 'ऑफर': 'तेजी से प्रक्रिया', 'दूरी': '3.2 km'}
                ]
            }
        },
        'scheme': {
            'message': 'PM-KISAN योजना के लिए आप पूर्ण रूप से पात्र हैं। यह योजना आपको हर 4 महीने में ₹2,000 देगी। मैं आपको योजनाओं के पेज पर ले जा रहा हूँ।',
            'speak': 'PM-KISAN योजना के लिए आवेदन करने के लिए मैं आपको योजनाओं पेज पर भेज रहा हूँ।',
            'redirect': 'schemes',
            'result': {
                'items': [
                    {'योजना': 'PM-KISAN', 'लाभ': '₹6,000 वार्षिक', 'स्थिति': 'पात्र'}
                ]
            }
        },
        'mandi': {
            'message': 'आपके क्षेत्र में वर्तमान में गेहूं का भाव ₹2,500 प्रति क्विंटल है। आप हमारे मंडी विभाग में सभी फसलों के भाव देख सकते हैं।',
            'speak': 'मंडी के वर्तमान भाव जानने के लिए मैं आपको मंडी पेज पर ले जा रहा हूँ।',
            'redirect': 'mandi',
            'result': {
                'items': [
                    {'फसल': 'गेहूं', 'भाव': '₹2,500', 'प्रवृत्ति': 'स्थिर'},
                    {'फसल': 'चावल', 'भाव': '₹4,200', 'प्रवृत्ति': 'ऊपर'}
                ]
            }
        }
    },
    'en': {
        'loan': {
            'message': 'Based on your budget, you are eligible for tractor loans from nearby banks like SBI or Bank of Baroda. I am taking you to the loan page where you can compare interest rates.',
            'speak': 'I am directing you to the loan page to see available loan options.',
            'redirect': 'loan',
            'result': {
                'items': [
                    {'Bank': 'SBI Nagpur', 'Offer': 'Low interest rate', 'Distance': '2.5 km'},
                    {'Bank': 'Bank of Baroda', 'Offer': 'Quick process', 'Distance': '3.2 km'}
                ]
            }
        },
        'scheme': {
            'message': 'You are fully eligible for PM-KISAN scheme. This scheme will give you ₹2,000 every 4 months. I am taking you to the schemes page.',
            'speak': 'I am directing you to the schemes page to apply for PM-KISAN.',
            'redirect': 'schemes',
            'result': {
                'items': [
                    {'Scheme': 'PM-KISAN', 'Benefit': '₹6,000 annually', 'Status': 'Eligible'}
                ]
            }
        },
        'mandi': {
            'message': 'Current wheat prices in your area are ₹2,500 per quintal. You can check prices for all crops in our mandi section.',
            'speak': 'I am directing you to the mandi page to check current prices.',
            'redirect': 'mandi',
            'result': {
                'items': [
                    {'Crop': 'Wheat', 'Price': '₹2,500', 'Trend': 'Stable'},
                    {'Crop': 'Rice', 'Price': '₹4,200', 'Trend': 'Up'}
                ]
            }
        }
    }
}


def get_mock_response(query, language='en', context=None):
    """Get mock voice agent response based on query"""
    query_lower = query.lower()
    lang_responses = MOCK_VOICE_RESPONSES.get(language, MOCK_VOICE_RESPONSES.get('en', {}))
    
    # Route based on query keywords
    if any(word in query_lower for word in ['loan', 'tractor', 'credit', 'बैंक', 'ऋण']):
        return lang_responses.get('loan', lang_responses.get('scheme'))
    elif any(word in query_lower for word in ['scheme', 'pm-kisan', 'योजना', 'सहायता']):
        return lang_responses.get('scheme', lang_responses.get('loan'))
    elif any(word in query_lower for word in ['price', 'mandi', 'crop', 'भाव', 'मंडी', 'फसल']):
        return lang_responses.get('mandi', lang_responses.get('scheme'))
    else:
        return lang_responses.get('scheme', {})


def create_response_json(message, speak, redirect, items, language='en'):
    """Create structured AI response JSON"""
    return {
        'message': message,
        'speak': speak,
        'redirect': redirect,
        'result': {
            'items': items
        },
        'language': language,
        'source': 'mock'
    }
