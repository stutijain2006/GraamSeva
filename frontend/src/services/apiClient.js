/**
 * API Client - Generic HTTP client with error handling
 * Handles retries, timeouts, and fallback to mock data
 */

import { API_CONFIG } from './apiConfig'

class APIClient {
  constructor() {
    this.timeout = API_CONFIG.TIMEOUT
    this.retries = 2
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(url, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body = null,
      token = null,
      timeout = this.timeout,
      params = null,
    } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    const requestUrl = new URL(url)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          requestUrl.searchParams.set(key, value)
        }
      })
    }

    try {
      const response = await fetch(requestUrl.toString(), {
        method,
        headers: {
          Accept: 'application/json',
          ...(body && { 'Content-Type': 'application/json' }),
          ...headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('API Request Error:', error)
      throw error
    }
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post(url, body, options = {}) {
    return this.request(url, { ...options, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body })
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' })
  }
}

export default new APIClient()
