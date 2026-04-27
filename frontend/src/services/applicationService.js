/**
 * Application Service
 * Handles application submission and tracking
 */

import { API_ENDPOINTS, buildURL } from './apiConfig'
import { MOCK_APPLICATION_RESPONSE } from './mockData'
import apiClient from './apiClient'

const defaultNextSteps = [
  'Your application has been submitted.',
  'Verification will begin shortly.',
  'You will be notified of status updates.',
]

const toIsoDate = (value) => {
  const parsed = value ? new Date(value) : null
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString()
}

const toReferenceId = (item = {}) => item.application_id || item.referenceId || item.id || null

const normalizeApplication = (item = {}) => ({
  referenceId: toReferenceId(item),
  status: item.status || 'SUBMITTED',
  farmerName: item.farmer_name || item.farmerName || '',
  schemeId: item.scheme_id || item.schemeId || null,
  submittedAt: item.submitted_at || item.submittedAt || item.created_at || new Date().toISOString(),
  applicationData: item.application_data || item.applicationData || {},
})

class ApplicationService {
  /**
   * Submit application
   * @param {Object} applicationData - Complete application data
   * @param {String} language - Language code
   * @returns {Object} Submission response with reference ID
   */
  async submitApplication(applicationData, language = 'hi') {
    try {
      console.log('Submitting application to API...')
      
      const url = buildURL(API_ENDPOINTS.APPLICATIONS.SUBMIT)
      const now = new Date().toISOString()
      const payload = {
        application_id: applicationData.application_id || `APP-${Date.now()}`,
        scheme_id: applicationData.scheme_id || applicationData.schemeId || 0,
        farmer_name: applicationData.farmer_name || applicationData.fullName || applicationData.name || 'GraamSeva User',
        farmer_phone: applicationData.farmer_phone || applicationData.mobile || applicationData.phone || '0000000000',
        farmer_aadhar: applicationData.farmer_aadhar || applicationData.aadhaar || applicationData.aadhar || null,
        status: applicationData.isDraft ? 'DRAFT' : 'SUBMITTED',
        application_data: applicationData,
        language,
        submittedAt: new Date().toISOString(),
      }

      const response = await apiClient.post(url, payload)
      const normalized = normalizeApplication(response)

      console.log('Application submitted successfully:', response)
      
      return {
        success: true,
        data: response,
        referenceId: response.referenceId || response.application_id,
        source: response.source || 'api',
      }
    } catch (error) {
      console.warn('Application submission API failed, using mock response:', error.message)
      
      return {
        success: true,
        data: MOCK_APPLICATION_RESPONSE,
        referenceId: MOCK_APPLICATION_RESPONSE.referenceId,
        source: 'mock',
      }
    }
  }

  /**
   * Get application status
   * @param {String} referenceId - Application reference ID
   * @returns {Object} Application status
   */
  async getApplicationStatus(referenceId) {
    try {
      console.log(`Fetching status for application: ${referenceId}`)
      
      const url = buildURL(
        API_ENDPOINTS.APPLICATIONS.GET_STATUS.replace(':referenceId', referenceId)
      )
      const response = await apiClient.get(url)
      const normalized = normalizeApplication(response)

      return {
        data: {
          ...normalized,
          lastUpdated: toIsoDate(response.updated_at || response.updatedAt),
          estimatedCompletion: '7-15 days',
        },
        source: 'api',
      }
    } catch (error) {
      console.warn(`Status API failed for ${referenceId}, using mock data:`, error.message)
      
      return {
        data: {
          referenceId,
          status: 'Processing',
          lastUpdated: new Date().toISOString(),
          estimatedCompletion: '7-15 days',
        },
        source: 'mock',
      }
    }
  }

  /**
   * Get user applications
   * @param {String} userId - User ID
   * @returns {Array} List of user applications
   */
  async getUserApplications(userId) {
    try {
      console.log(`Fetching applications for user: ${userId}`)
      
      const url = buildURL(API_ENDPOINTS.APPLICATIONS.LIST)
      const response = await apiClient.get(url, { params: { user_id: userId } })

      return {
        data: response.applications || response.results || response,
        source: response.source || 'api',
      }
    } catch (error) {
      console.warn(`User applications API failed, returning empty array:`, error.message)
      
      return {
        data: [],
        source: 'mock',
      }
    }
  }

  /**
   * Track application with reference ID
   * @param {String} referenceId - Application reference ID
   * @returns {Object} Tracking information
   */
  async trackApplication(referenceId) {
    try {
      console.log(`Tracking application: ${referenceId}`)
      
      const url = buildURL(
        API_ENDPOINTS.APPLICATIONS.TRACK.replace(':referenceId', referenceId)
      )
      const response = await apiClient.get(url)
      const normalized = normalizeApplication(response)

      return {
        data: {
          referenceId: normalized.referenceId,
          status: normalized.status,
          timeline: [
            { step: 'Application Received', date: normalized.submittedAt },
            {
              step: 'Under Review',
              date: normalized.status === 'UNDER_REVIEW' || normalized.status === 'APPROVED' ? toIsoDate(response.updated_at) : null,
            },
            {
              step: 'Approved',
              date: normalized.status === 'APPROVED' ? toIsoDate(response.updated_at) : null,
            },
            { step: 'Amount Transferred', date: null },
          ],
        },
        source: 'api',
      }
    } catch (error) {
      console.warn(`Tracking API failed, using mock data:`, error.message)
      
      return {
        data: {
          referenceId,
          status: 'Submitted',
          timeline: [
            { step: 'Application Received', date: new Date().toISOString() },
            { step: 'Under Review', date: null },
            { step: 'Approved', date: null },
            { step: 'Amount Transferred', date: null },
          ],
        },
        source: 'mock',
      }
    }
  }

  /**
   * Draft application (save progress)
   * @param {Object} draftData - Partial application data
   * @returns {Object} Draft saved response
   */
  async saveDraft(draftData) {
    try {
      const url = buildURL(API_ENDPOINTS.APPLICATIONS.SUBMIT)
      const response = await apiClient.post(url, {
        ...draftData,
        isDraft: true,
      })

      return {
        success: true,
        data: response,
        source: 'api',
      }
    } catch (error) {
      console.warn('Draft save failed, saving to localStorage:', error.message)
      
      // Fallback: Save to localStorage
      localStorage.setItem('applicationDraft', JSON.stringify(draftData))
      
      return {
        success: true,
        data: { message: 'Draft saved locally' },
        source: 'mock',
      }
    }
  }

  /**
   * Load draft application from localStorage
   * @returns {Object} Draft data if exists
   */
  loadDraft() {
    try {
      const draft = localStorage.getItem('applicationDraft')
      return draft ? JSON.parse(draft) : null
    } catch (error) {
      console.error('Error loading draft:', error)
      return null
    }
  }

  /**
   * Clear draft
   */
  clearDraft() {
    localStorage.removeItem('applicationDraft')
  }
}

export default new ApplicationService()
