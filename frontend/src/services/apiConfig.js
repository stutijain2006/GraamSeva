/**
 * API Configuration
 * Central configuration for all API endpoints
 * Fallback to mock data if APIs are unavailable
 */

// ============================================
// API BASE URLS
export const API_CONFIG = {
  // Main API Base URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.graamseva.in',

  // Timeout for API calls (ms)
  TIMEOUT: 10000,

}

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  // Voice & Speech
  SPEECH: {
    TRANSCRIBE: '/api/speech/transcribe',
    TTS: '/api/speech/tts',
  },

  // Intent & Routing
  INTENT: {
    ROUTE: '/api/intent/route',
    CLASSIFY: '/api/intent/classify',
  },

  // Schemes
  SCHEMES: {
    LIST: '/api/schemes',
    GET_BY_ID: '/api/schemes/:id',
    SEARCH: '/api/schemes/search',
    BY_STATE: '/api/schemes/state/:state',
    POPULAR: '/api/schemes/popular',
  },

  // Eligibility
  ELIGIBILITY: {
    CHECK: '/api/eligibility/check',
    GET_CRITERIA: '/api/eligibility/criteria/:schemeId',
    VERIFY: '/api/eligibility/verify',
  },

  // Applications
  APPLICATIONS: {
    SUBMIT: '/api/applications/submit',
    GET_STATUS: '/api/applications/:referenceId',
    LIST: '/api/applications/user/:userId',
    TRACK: '/api/applications/track/:referenceId',
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
    STATS: '/api/dashboard/stats',
    ACTIVITIES: '/api/dashboard/activities',
    CHART_DATA: '/api/dashboard/chart/:metric',
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
    MANDI_PRICES: '/api/mandi/prices',
    WEATHER: '/api/weather/village/:villageCode',
    COLD_STORAGE: '/api/cold-storage/nearby',
  },
  NEW_SCHEMES: {
    LIST: '/api/new-schemes',
    GET_BY_ID: '/api/new-schemes/:id',
  },
  AI: {
    HOME_UPDATES: '/api/ai/home-updates',
    NEARBY_LOANS: '/api/ai/nearby-loans',
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


