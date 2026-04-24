export const STORAGE_KEYS = {
  profile: 'gs_profile',
  history: 'gs_conversations',
  location: 'gs_location',
}

export const LANGUAGES = [
  { code: 'hi', label: 'Hindi (हिंदी)' },
  { code: 'bho', label: 'Bhojpuri (भोजपुरी)' },
  { code: 'awa', label: 'Awadhi (अवधी)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'mai', label: 'Maithili (मैथिली)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'en', label: 'English (अंग्रेज़ी)' },
]

// Each language now maps to itself — no collapsing to Hindi
export const UI_LANGUAGE_MAP = {
  hi: 'hi',
  bho: 'bho',
  awa: 'awa',
  mr: 'mr',
  mai: 'mai',
  or: 'or',
  en: 'en',
}

export const PAGES = [
  { id: 'home', icon: 'home' },
  { id: 'schemes', icon: 'assignment' },
  { id: 'mandi', icon: 'storefront' },
  { id: 'loan', icon: 'account_balance' },
  { id: 'apply', icon: 'description' },
  { id: 'history', icon: 'history' },
]