/**
 * API Configuration
 * Central configuration for all API endpoints
 * Fallback to mock data if APIs are unavailable
 */

// ============================================
// API BASE URLS
export const API_CONFIG = {
  // Main API Base URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',

  // Timeout for API calls (ms)
  TIMEOUT: 10000,

}

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  // Voice & Speech
  SPEECH: {
    TRANSCRIBE: '/api/v1/voice/transcripts/',
    TTS: '/api/v1/voice/agent/tts/',
  },

  // Intent & Routing
  INTENT: {
    ROUTE: '/api/v1/voice/agent/chat/',
    CLASSIFY: '/api/v1/voice/agent/chat/',
  },

  // Schemes
  SCHEMES: {
    LIST: '/api/v1/schemes/',
    GET_BY_ID: '/api/v1/schemes/:id/',
    SEARCH: '/api/v1/schemes/search/',
    BY_STATE: '/api/v1/schemes/by_state/',
    POPULAR: '/api/v1/schemes/popular/',
  },

  // Eligibility
  ELIGIBILITY: {
    CHECK: '/api/v1/eligibility/check/',
    GET_CRITERIA: '/api/v1/eligibility/criteria/',
    VERIFY: '/api/v1/eligibility/verify/',
  },

  // Applications
  APPLICATIONS: {
    SUBMIT: '/api/v1/applications/',
    GET_STATUS: '/api/v1/applications/:referenceId/',
    LIST: '/api/v1/applications/',
    TRACK: '/api/v1/applications/:referenceId/',
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
    STATS: '/api/v1/dashboard/stats/',
    ACTIVITIES: '/api/v1/dashboard/activities/',
    CHART_DATA: '/api/v1/dashboard/chart_data/',
    LIVE_UPDATES: '/ws/dashboard/live',
  },

  // User Profile
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/profile/update',
    PREFERENCES: '/api/user/preferences',
  },

  // Miscellaneous
  MISC: {
    MANDI_PRICES: '/api/v1/mandi/',
    WEATHER: '/api/weather/village/:villageCode',
    COLD_STORAGE: '/api/cold-storage/nearby',
  },
  NEW_SCHEMES: {
    LIST: '/api/v1/schemes/',
    GET_BY_ID: '/api/v1/schemes/:id/',
  },
  MANDI: {
    LIST: '/api/v1/mandi/',
    GET_CROP: '/api/v1/mandi/by_crop/',
  },
  LOANS: {
    LIST: '/api/v1/loans/',
    NEARBY: '/api/v1/loans/nearby/',
    CALCULATE: '/api/v1/loans/calculate/',
  },
  AI: {
    CHAT: '/api/v1/voice/agent/chat/',
    HOME_UPDATES: '/api/v1/voice/agent/home_updates/',
    NEARBY_LOANS: '/api/v1/voice/agent/nearby_loans/',
  },
}

// ============================================
// Helper Functions
// ============================================

/**
 * Build full URL from endpoint
 */
export const buildURL = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`

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


