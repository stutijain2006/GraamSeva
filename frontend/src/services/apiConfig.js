/**
 * API Configuration
 * Central configuration for all API endpoints
 * Fallback to mock data if APIs are unavailable
 */

// ============================================
// API BASE URLS
const DEFAULT_DEV_BASE_URL = 'http://127.0.0.1:8000'
const DEFAULT_PROD_BASE_URL = 'https://api.graamseva.in'

export const API_CONFIG = {
  // Main API Base URL
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.MODE === 'development' ? DEFAULT_DEV_BASE_URL : DEFAULT_PROD_BASE_URL),

  // Prefix added to legacy /api/* endpoints (useful for local Django /api/v1/* routes)
  API_PREFIX:
    import.meta.env.VITE_API_PREFIX ||
    (import.meta.env.MODE === 'development' ? '/api/v1' : ''),

  // Timeout for API calls (ms)
  TIMEOUT: 10000,

}

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  // Voice & Speech
  SPEECH: {
    TRANSCRIBE: '/api/voice/transcripts/',
    TTS: '/api/voice/agent/chat/',
  },

  // Intent & Routing
  INTENT: {
    ROUTE: '/api/intent/route',
    CLASSIFY: '/api/intent/classify',
  },

  // Schemes
  SCHEMES: {
    LIST: '/api/schemes/',
    GET_BY_ID: '/api/schemes/:id/',
    SEARCH: '/api/schemes/search/',
    BY_STATE: '/api/schemes/',
    POPULAR: '/api/schemes/',
  },

  // Eligibility
  ELIGIBILITY: {
    CHECK: '/api/eligibility/check/',
    GET_CRITERIA: '/api/eligibility/',
    VERIFY: '/api/eligibility/check/',
  },

  // Applications
  APPLICATIONS: {
    SUBMIT: '/api/applications/',
    GET_STATUS: '/api/applications/:referenceId/',
    LIST: '/api/applications/',
    TRACK: '/api/applications/:referenceId/',
  },

  // Authentication
  AUTH: {
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    VERIFY_AADHAAR: '/api/auth/verify-aadhaar',
    LOGOUT: '/api/auth/logout',
  },

  // Dashboard & Analytics
  DASHBOARD: {
    STATS: '/api/dashboard/stats/',
    ACTIVITIES: '/api/dashboard/stats/',
    CHART_DATA: '/api/dashboard/stats/',
    LIVE_UPDATES: '/ws/dashboard/live',
  },

  MANDI: {
    LIST: '/api/mandi/',
    GET_CROP: '/api/mandi/:id/',
  },

  LOANS: {
    LIST: '/api/loans/',
    NEARBY: '/api/loans/nearby/',
    CALCULATE: '/api/loans/calculate/',
  },

  // User Profile
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/profile/update',
    PREFERENCES: '/api/user/preferences',
  },

  // Miscellaneous
  MISC: {
    MANDI_PRICES: '/api/mandi/prices',
    WEATHER: '/api/weather/village/:villageCode',
    COLD_STORAGE: '/api/cold-storage/nearby',
  },
  NEW_SCHEMES: {
    LIST: '/api/schemes/',
    GET_BY_ID: '/api/schemes/:id/',
  },
  AI: {
    HOME_UPDATES: '/api/schemes/search/',
    NEARBY_LOANS: '/api/loans/nearby/',
  },
}

// ============================================
// Helper Functions
// ============================================

/**
 * Build full URL from endpoint
 */
export const buildURL = (endpoint, params = {}) => {
  let normalizedEndpoint = endpoint

  if (API_CONFIG.API_PREFIX) {
    normalizedEndpoint = endpoint.replace(/^\/api(\/|$)/, `${API_CONFIG.API_PREFIX}$1`)
  }

  let url = `${API_CONFIG.BASE_URL}${normalizedEndpoint}`

  // Replace URL parameters
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value)
  })

  return url
}

/**
 * Get API call timeout
 */
export const getTimeout = () => API_CONFIG.TIMEOUT

/**
 * Build headers with auth token
 */
export const buildHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * Environment check
 */
export const isDevelopment = () => import.meta.env.MODE === 'development'
export const isProduction = () => import.meta.env.MODE === 'production'


