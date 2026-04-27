/**
 * Dashboard Service
 * Handles dashboard data and analytics
 */

import { API_CONFIG, API_ENDPOINTS, buildURL } from './apiConfig'
import { MOCK_DASHBOARD_STATS } from './mockData'
import apiClient from './apiClient'

class DashboardService {
  /**
   * Get dashboard statistics
   * @param {Object} filters - Filter options (period, operatorId, etc)
   * @returns {Object} Dashboard statistics
   */
  async getDashboardStats(filters = {}) {
    try {
      console.log('Fetching dashboard stats from API...')
      
      const url = buildURL(API_ENDPOINTS.DASHBOARD.STATS)
      const response = await apiClient.get(url, { params: filters })

      console.log('Dashboard stats fetched:', response)
      
      return {
        data: response.data || response,
        source: response.source || 'api',
      }
    } catch (error) {
      console.warn('Dashboard stats API failed, using mock data:', error.message)
      
      return {
        data: MOCK_DASHBOARD_STATS,
        source: 'mock',
      }
    }
  }

  /**
   * Get recent activities
   * @param {Object} options - Pagination and filter options
   * @returns {Array} Recent activity list
   */
  async getRecentActivities(options = {}) {
    try {
      console.log('Fetching recent activities...')
      
      const url = buildURL(API_ENDPOINTS.DASHBOARD.ACTIVITIES)
      const response = await apiClient.get(url, { params: options })

      return {
        data: response.activities || response,
        source: 'api',
      }
    } catch (error) {
      console.warn('Activities API failed, using mock data:', error.message)
      
      return {
        data: MOCK_DASHBOARD_STATS.recentActivities,
        source: 'mock',
      }
    }
  }

  /**
   * Get chart data for specific metric
   * @param {String} metric - Metric name (calls, approvals, amount, etc)
   * @param {Object} filters - Filter options
   * @returns {Object} Chart data
   */
  async getChartData(metric, filters = {}) {
    try {
      console.log(`Fetching chart data for metric: ${metric}`)
      
      const url = buildURL(
        API_ENDPOINTS.DASHBOARD.CHART_DATA
      )
      const response = await apiClient.get(url, { params: { ...filters, metric } })

      return {
        data: response,
        source: 'api',
      }
    } catch (error) {
      console.warn(`Chart data API failed for ${metric}:`, error.message)
      
      // Return mock chart data
      const mockCharts = {
        calls: [
          { time: '12am', value: 45 },
          { time: '6am', value: 120 },
          { time: '12pm', value: 200 },
          { time: '6pm', value: 180 },
        ],
        language: MOCK_DASHBOARD_STATS.languageBreakdown,
      }

      return {
        data: mockCharts[metric] || [],
        source: 'mock',
      }
    }
  }

  /**
   * Subscribe to real-time updates via WebSocket
   * @param {Function} onUpdate - Callback for updates
   * @returns {WebSocket} WebSocket connection
   */
  subscribeToLiveUpdates(onUpdate) {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const apiUrl = new URL(API_CONFIG.BASE_URL)
      const url = `${protocol}//${apiUrl.host}${API_ENDPOINTS.DASHBOARD.LIVE_UPDATES}`
      
      console.log('Connecting to live updates...')
      const ws = new WebSocket(url)

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data)
          onUpdate(update)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.warn('WebSocket error, falling back to polling:', error)
        this.startPolling(onUpdate)
      }

      return ws
    } catch (error) {
      console.warn('WebSocket connection failed, starting polling:', error)
      this.startPolling(onUpdate)
      return null
    }
  }

  /**
   * Fallback polling for real-time updates
   * @param {Function} onUpdate - Callback for updates
   */
  startPolling(onUpdate, interval = 5000) {
    console.log('Starting polling for updates...')
    
    this.pollInterval = setInterval(async () => {
      try {
        const stats = await this.getDashboardStats()
        onUpdate(stats.data)
      } catch (error) {
        console.warn('Polling error:', error)
      }
    }, interval)
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  }

  /**
   * Get summary report
   * @param {Object} filters - Filter options
   * @returns {Object} Summary report
   */
  async getSummaryReport(filters = {}) {
    try {
      console.log('Generating summary report...')
      
      const stats = await this.getDashboardStats(filters)
      
      return {
        period: filters.period || 'today',
        totalCalls: stats.data.todaysCalls,
        applicationsProcessed: stats.data.applicationsProcessed,
        amountUnlocked: stats.data.amountUnlocked,
        approvalRate: stats.data.approvalRate,
        topLanguages: stats.data.languageBreakdown?.slice(0, 3) || [],
        source: stats.source,
      }
    } catch (error) {
      console.error('Report generation failed:', error)
      return null
    }
  }
}

export default new DashboardService()
