/**
 * Mandi Service
 * Handles mandi (market) prices data retrieval
 */

import { API_ENDPOINTS, buildURL } from './apiConfig'
import { getMockMandiPrices } from './mockData'
import apiClient from './apiClient'

const formatPrice = (value) => {
  if (typeof value === 'string' && value.trim()) return value
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '₹0'
  return `₹${numeric.toLocaleString('en-IN')}`
}

const normalizeMandi = (item = {}) => ({
  id: item.id ?? item.mandi_id,
  mandi: item.mandi || item.mandi_name || 'Mandi',
  state: item.state || '',
  district: item.district || '',
  crops: (Array.isArray(item.crops) ? item.crops : []).map((crop) => ({
    crop: crop.crop || crop.name || 'Crop',
    price: formatPrice(crop.price),
    trend: crop.trend || 'stable',
    change: crop.change || '-',
    unit: crop.unit || '',
  })),
})

const normalizeMandiList = (response) => {
  const raw =
    (Array.isArray(response) && response) ||
    response?.results ||
    response?.prices ||
    response?.mandis ||
    []
  return raw.map(normalizeMandi)
}

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
        data: normalizeMandiList(response),
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

      const url = buildURL(API_ENDPOINTS.MANDI.LIST)
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
      })
      const list = normalizeMandiList(response)
      const match = list.find((mandi) =>
        (mandi.crops || []).some((c) => c.crop.toLowerCase().includes(cropName.toLowerCase()))
      )

      console.log('Crop price fetched successfully:', response)
      return {
        data: match || list[0] || null,
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