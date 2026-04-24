/**
 * Eligibility Service
 * Handles eligibility checking and verification
 */

import { API_ENDPOINTS, buildURL } from './apiConfig'
import { MOCK_ELIGIBILITY } from './mockData'
import apiClient from './apiClient'

class EligibilityService {
  /**
   * Check eligibility for a scheme
   * @param {Number} schemeId - Scheme ID
   * @param {Object} userData - User data (land, income, etc)
   * @param {String} language - Language code
   * @returns {Object} Eligibility result
   */
  async checkEligibility(schemeId, userData, language = 'hi') {
    try {
      console.log('Checking eligibility from API...')
      
      const url = buildURL(API_ENDPOINTS.ELIGIBILITY.CHECK)
      const response = await apiClient.post(url, {
        schemeId,
        userData,
        language,
      })

      console.log('Eligibility check result:', response)
      
      return {
        data: response,
        eligible: response.eligible,
        score: response.score || 0,
        source: 'api',
      }
    } catch (error) {
      console.warn('Eligibility API failed, using mock data:', error.message)
      
      const mockData = MOCK_ELIGIBILITY[schemeId] || MOCK_ELIGIBILITY[1]
      const verifiedCount = mockData.requirements.filter(
        (r) => r.status === 'verified'
      ).length

      return {
        data: mockData,
        eligible: verifiedCount >= 2,
        score: verifiedCount * 25,
        source: 'mock',
      }
    }
  }

  /**
   * Get eligibility criteria for a scheme
   * @param {Number} schemeId - Scheme ID
   * @param {String} language - Language code
   * @returns {Object} Eligibility criteria
   */
  async getEligibilityCriteria(schemeId, language = 'hi') {
    try {
      console.log(`Fetching eligibility criteria for scheme ${schemeId}...`)
      
      const url = buildURL(
        API_ENDPOINTS.ELIGIBILITY.GET_CRITERIA.replace(':schemeId', schemeId)
      )
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
      })

      return {
        data: response,
        source: 'api',
      }
    } catch (error) {
      console.warn(`Eligibility criteria API failed for ${schemeId}, using mock data:`, error.message)
      
      const mockData = MOCK_ELIGIBILITY[schemeId] || MOCK_ELIGIBILITY[1]
      return {
        data: mockData,
        source: 'mock',
      }
    }
  }

  /**
   * Verify eligibility with detailed analysis
   * @param {Number} schemeId - Scheme ID
   * @param {Object} formData - Application form data
   * @param {String} language - Language code
   * @returns {Object} Verification result
   */
  async verifyEligibility(schemeId, formData, language = 'hi') {
    try {
      console.log('Verifying eligibility from API...')
      
      const url = buildURL(API_ENDPOINTS.ELIGIBILITY.VERIFY)
      const response = await apiClient.post(url, {
        schemeId,
        formData,
        language,
      })

      return {
        data: response,
        verified: response.verified,
        issues: response.issues || [],
        source: 'api',
      }
    } catch (error) {
      console.warn('Verification API failed, using mock result:', error.message)
      
      return {
        data: {
          verified: true,
          message: 'Eligibility verified (Mock Data)',
        },
        verified: true,
        issues: [],
        source: 'mock',
      }
    }
  }
}

export default new EligibilityService()
