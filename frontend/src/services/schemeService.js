/**
 * Scheme Service
 * Handles scheme data retrieval and management
 */

import { API_ENDPOINTS, buildURL } from './apiConfig'
import { getMockSchemes, getMockSchemeById, getMockLatestOffers } from './mockData'
import apiClient from './apiClient'

const asList = (response, key) =>
  response?.[key] || response?.results || response?.data || (Array.isArray(response) ? response : [])

const normalizeScheme = (item = {}) => ({
  id: item.id ?? item.scheme_id,
  scheme_id: item.scheme_id ?? item.id,
  name: item.name || item.title || 'Scheme',
  icon: item.icon || '🌾',
  desc: item.desc || item.description || item.details || '',
  detail: item.detail || item.description || item.details || '',
  governmentLevel: item.governmentLevel || item.government_level || 'Government',
  states: Array.isArray(item.states) ? item.states : [],
  benefits: Array.isArray(item.benefits) ? item.benefits : [],
  howToApply: item.howToApply || item.how_to_apply || [],
  documents: item.documents || item.documents_required || [],
  eligibility: item.eligibility || {},
  authority: item.authority || {},
})

const normalizeSchemeList = (response) => asList(response, 'schemes').map(normalizeScheme)

class SchemeService {
  /**
   * Get all schemes
   * @param {String} language - Language code for localization
   * @returns {Object} { data: Array, source: 'api'|'mock' }
   */
  async getAllSchemes(language = 'hi') {
    try {
      console.log('Fetching schemes from API...')

      const url = buildURL(API_ENDPOINTS.SCHEMES.LIST)
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
      })

      console.log('Schemes fetched successfully:', response)
      return {
        data: normalizeSchemeList(response),
        source: response.source || 'api',
      }
    } catch (error) {
      console.warn('Schemes API failed, using mock data:', error.message)

      return {
        data: getMockSchemes(language),
        source: 'mock',
      }
    }
  }

  /**
   * Get scheme by ID
   * @param {Number} schemeId - Scheme ID
   * @param {String} language - Language code
   * @returns {Object} { data: Object, source: 'api'|'mock' }
   */
  async getSchemeById(schemeId, language = 'hi') {
    try {
      console.log(`Fetching scheme ${schemeId} from API...`)

      const url = buildURL(API_ENDPOINTS.SCHEMES.GET_BY_ID, { id: schemeId })
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
      })

      return {
        data: normalizeScheme(response),
        source: 'api',
      }
    } catch (error) {
      console.warn(`Scheme ${schemeId} API failed, using mock data:`, error.message)

      return {
        data: getMockSchemeById(schemeId, language),
        source: 'mock',
      }
    }
  }

  /**
   * Search schemes
   * @param {String} query - Search query
   * @param {String} language - Language code
   * @returns {Object} { data: Array, source: 'api'|'mock' }
   */
  async searchSchemes(query, language = 'hi') {
    try {
      console.log('Searching schemes API...')

      const url = buildURL(API_ENDPOINTS.SCHEMES.SEARCH)
      const response = await apiClient.post(url, { query, language })

      return {
        data: normalizeSchemeList(response),
        source: 'api',
      }
    } catch (error) {
      console.warn('Search API failed, filtering mock data:', error.message)

      const schemes = getMockSchemes(language)
      const results = schemes.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.desc.toLowerCase().includes(query.toLowerCase())
      )

      return {
        data: results,
        source: 'mock',
      }
    }
  }

  /**
   * Get schemes by state
   * @param {String} state - State code
   * @param {String} language - Language code
   * @returns {Object} { data: Array, source: 'api'|'mock' }
   */
  async getSchemesByState(state, language = 'hi') {
    try {
      console.log(`Fetching schemes for state: ${state}`)

      const url = buildURL(API_ENDPOINTS.SCHEMES.BY_STATE)
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
        params: { state },
      })

      const normalizedState = String(state || '').trim().toLowerCase()
      const filtered = normalizeSchemeList(response).filter((scheme) => {
        if (!Array.isArray(scheme.states) || scheme.states.length === 0) return true

        const normalizedSchemeStates = scheme.states.map((s) => String(s || '').toLowerCase())
        return (
          normalizedSchemeStates.includes('all') ||
          normalizedSchemeStates.some(
            (schemeState) =>
              schemeState === normalizedState ||
              schemeState.includes(normalizedState) ||
              normalizedState.includes(schemeState),
          )
        )
      })

      return {
        data: filtered,
        source: response.source || 'api',
      }
    } catch (error) {
      console.warn(`State schemes API failed for ${state}, using mock data:`, error.message)

      const normalizedState = String(state || '').trim().toLowerCase()
      const allSchemes = getMockSchemes(language)
      const filtered = allSchemes.filter((scheme) => {
        if (!Array.isArray(scheme.states) || scheme.states.length === 0) return true

        const normalizedSchemeStates = scheme.states.map((s) => String(s || '').toLowerCase())
        return (
          normalizedSchemeStates.includes('all') ||
          normalizedSchemeStates.some(
            (schemeState) =>
              schemeState === normalizedState ||
              schemeState.includes(normalizedState) ||
              normalizedState.includes(schemeState),
          )
        )
      })

      return {
        data: filtered,
        source: 'mock',
      }
    }
  }

  /**
   * Get popular schemes
   * @param {String} language - Language code
   * @returns {Object} { data: Array, source: 'api'|'mock' }
   */
  async getPopularSchemes(language = 'hi') {
    try {
      console.log('Fetching popular schemes...')

      const url = buildURL(API_ENDPOINTS.SCHEMES.POPULAR)
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
      })

      const items = normalizeSchemeList(response)

      return {
        data: items,
        source: response.source || 'api',
      }
    } catch (error) {
      console.warn('Popular schemes API failed, using mock data:', error.message)

      return {
        data: getMockSchemes(language).slice(0, 3),
        source: 'mock',
      }
    }
  }

  /**
   * Get latest schemes and offers
   * @param {String} language - Language code
   * @param {Number} limit - Number of items to return
   * @returns {Object} { data: Array, source: 'api'|'mock' }
   */
  async getLatestSchemesAndOffers(language = 'hi', limit = 5) {
    try {
      console.log('Fetching latest schemes and offers...')

      const url = buildURL(API_ENDPOINTS.SCHEMES.LIST)
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
      })

      const items = normalizeSchemeList(response)
      return {
        data: items.slice(0, limit),
        source: response.source || 'api',
      }
    } catch (error) {
      console.warn('Latest schemes API failed, using mock data:', error.message)

      return {
        data: getMockLatestOffers(language),
        source: 'mock',
      }
    }
  }
}

export default new SchemeService()
