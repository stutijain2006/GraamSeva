import { GoogleGenAI } from '@google/genai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

// Using the correct model depending on the library version
// You might need 'gemini-2.5-flash' or 'gemini-1.5-flash' based on the API key access. We will default to 2.5 flash.
const MODEL_NAME = 'gemini-2.5-flash'

let aiClient = null
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey })
} else {
  console.warn('VITE_GEMINI_API_KEY is not defined in the environment variables.')
}

/**
 * System instruction provided to the model.
 * It dictates the persona, format, and capabilities.
 */
const SYSTEM_INSTRUCTION = `You are the GraamSeva AI Assistant, an expert advisor for Indian farmers.
Your goal is to provide deeply contextual, helpful, and action-oriented advice while navigating users to the right part of the app.

Available Application Pages and their IDs:
- home: Dashboard/Overview.
- schemes: List of government schemes (PM-KISAN, subsidies).
- mandi: Real-time crop market prices.
- loan: Agricultural/Tractor finance and bank options.
- apply: Forms for schemes or loans.
- history: Past application status.

CORE CAPABILITIES:
1. CONTEXTUAL REASONING:
   - If a user mentions a budget (e.g., "I have 10,000 for a tractor"), realize that is a Downpayment. Explain that they can get a loan for the rest and suggest specific nearby banks.
   - Summarize what the user will see on the redirected page.

2. LOCATION AWARENESS:
   - Use the provided location (Latitude/Longitude or City) to suggest "nearby" Mandis or Bank branches. 

3. STRICT LANGUAGE ADHERENCE:
   - You MUST respond in the user's PREFERRED LANGUAGE provided in the prompt.
   - Supported Language Codes:
     - hi: Hindi (use Devanagari script)
     - en: English (use Latin script)
     - bho: Bhojpuri (use Devanagari script)
     - awa: Awadhi (use Devanagari script)
     - mr: Marathi (use Devanagari script)
     - mai: Maithili (use Devanagari script)
     - or: Odia (use Odia script)
   - Do NOT respond in English if the preference is a regional language, even if the user query is in English. Use the specific dialect and tone appropriate for that language.

RESPONSE FORMAT:
You MUST respond in STRICT JSON.
JSON Structure:
{
  "message": "Detailed but concise answer (max 4 sentences) in the user's PREFERRED LANGUAGE.",
  "speak": "Conversational short summary (1 sentence) in the user's PREFERRED LANGUAGE.",
  "redirect": "page_id",
  "result": {
    "items": [
      { "Label": "Value", "Detail": "Description" }
    ]
  }
}

Example for "Tractor loan" with preference "hi" (Hindi):
{
  "message": "आपके बजट के अनुसार, आप पास के बैंकों जैसे SBI या बैंक ऑफ महाराष्ट्र से ट्रैक्टर लोन के लिए पात्र हैं। मैं आपको लोन पेज पर ले जा रहा हूँ जहाँ आप ब्याज दरों की तुलना कर सकते हैं।",
  "speak": "लोन के विकल्पों की जानकारी के लिए मैं आपको लोन पेज पर भेज रहा हूँ।",
  "redirect": "loan",
  "result": {
    "items": [
        { "बैंक": "SBI नागपुर", "ऑफर": "कम ब्याज दर", "दूरी": "2.5 km" }
    ]
  }
}`

export const generateChatResponse = async (query, language = 'en', context = {}) => {
  if (!aiClient) {
    throw new Error('Gemini AI Client is not initialized (missing API Key).')
  }

  const { profile = {}, location = {} } = context

  // Construct a contextual user prompt
  const userContextPrompt = `
USER LANGUAGE PREFERENCE: ${language} (MUST RESPOND IN THIS LANGUAGE)
User Profile: Name: ${profile.name || 'Unknown'}.
User Location: ${location.lat ? `Lat: ${location.lat}, Lng: ${location.lng}` : 'Unavailable'}.
User Query: "${query}"

Please provide a highly relevant response in ${language} based on this specific user data.`

  try {
    const response = await aiClient.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            { text: userContextPrompt }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      }
    })


    const responseText = response.text || ''
    try {
      // Parse the JSON. The model is instructed to return pure JSON.
      const data = JSON.parse(responseText)
      return data
    } catch (parseError) {
      console.error('Failed to parse JSON from Gemini response:', parseError, responseText)
      // Fallback response if the model violates the JSON format rule
      return {
        message: responseText.trim() || 'I could not process your request.',
        speak: 'I encountered an error understanding your request.',
        redirect: 'home',
        result: { items: [] }
      }
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw error
  }
}
