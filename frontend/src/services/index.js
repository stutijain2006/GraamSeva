/**
 * Service Layer Index
 * Central export for all API services
 */

export { default as voiceService } from './voiceService'
export { default as schemeService } from './schemeService'
export { default as eligibilityService } from './eligibilityService'
export { default as applicationService } from './applicationService'
export { default as dashboardService } from './dashboardService'
export { default as mandiService } from './mandiService'
export { default as loanService } from './loanService'
export { default as apiClient } from './apiClient'

export {
  API_CONFIG,
  API_ENDPOINTS,
  buildURL,
  getTimeout,
  buildHeaders,
  isDevelopment,
  isProduction,
} from './apiConfig'

export {
  MOCK_SCHEMES,
  MOCK_ELIGIBILITY,
  MOCK_DASHBOARD_STATS,
  MOCK_TRANSCRIPTS,
  MOCK_APPLICATION_RESPONSE,
  MOCK_LATEST_OFFERS,
  MOCK_MANDI_PRICES,
  MOCK_LOAN_OPTIONS,
} from './mockData'
