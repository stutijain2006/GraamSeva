/**
 * Mandi Service
 * Handles mandi (market) prices data retrieval
 */

import { API_ENDPOINTS, buildURL } from './apiConfig'
import { getMockMandiPrices } from './mockData'
import apiClient from './apiClient'

class MandiService {
  /**
   * Get mandi prices
   * @param {String} language - Language code for localization
   * @param {String} location - Optional location filter
   * @returns {Object} { data: Array, source: 'api'|'mock' }
   */
  async getMandiPrices(language = 'hi', location = null) {
    try {
      console.log('Fetching mandi prices from API...')

      const url = buildURL(API_ENDPOINTS.MANDI?.LIST || '/api/mandi')
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
        params: location ? { location } : {},
      })

      console.log('Mandi prices fetched successfully:', response)
      return {
        data: response.prices || response.data || response,
        source: 'api',
      }
    } catch (error) {
      console.warn('Mandi API failed, using mock data:', error.message)

      return {
        data: getMockMandiPrices(language),
        source: 'mock',
      }
    }
  }

  /**
   * Get price for specific crop
   * @param {String} cropName - Crop name
   * @param {String} language - Language code
   * @returns {Object} { data: Object, source: 'api'|'mock' }
   */
  async getCropPrice(cropName, language = 'hi') {
    try {
      console.log(`Fetching price for ${cropName} from API...`)

      const url = buildURL(API_ENDPOINTS.MANDI?.GET_CROP || `/api/mandi/${cropName}`)
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
      })

      console.log('Crop price fetched successfully:', response)
      return {
        data: response,
        source: 'api',
      }
    } catch (error) {
      console.warn('Crop price API failed, using mock data:', error.message)

      const prices = getMockMandiPrices(language)
      const match = prices.find((mandi) =>
        mandi.crops.some((c) => c.crop.toLowerCase().includes(cropName.toLowerCase()))
      )

      return {
        data: match || prices[0],
        source: 'mock',
      }
    }
  }
}

export default new MandiService()