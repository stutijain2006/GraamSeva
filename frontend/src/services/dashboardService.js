/**
 * Dashboard Service
 * Handles dashboard data and analytics
 */

import { API_CONFIG, API_ENDPOINTS, buildURL } from './apiConfig'
import { MOCK_DASHBOARD_STATS } from './mockData'
import apiClient from './apiClient'

const formatAmount = (value) => {
  if (typeof value === 'string' && value.trim()) return value
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '₹0'
  return `₹${numeric.toLocaleString('en-IN')}`
}

const normalizeActivityStatus = (status) => {
  const normalized = String(status || '').toUpperCase()
  if (normalized === 'APPROVED') return 'Approved'
  if (normalized === 'UNDER_REVIEW' || normalized === 'PROCESSING') return 'Processing'
  if (normalized === 'SUBMITTED' || normalized === 'PENDING') return 'Pending'
  if (normalized === 'REJECTED') return 'Rejected'
  return 'Pending'
}

const normalizeActivities = (items = []) =>
  items.map((item, index) => ({
    id: item.id || item.application_id || `activity-${index + 1}`,
    name: item.name || item.farmer_name || 'Farmer',
    scheme: item.scheme || item.scheme_name || `Scheme ${item.scheme_id || '-'}`,
    status: normalizeActivityStatus(item.status),
    amount: item.amount || '-',
    date: item.date || item.created_at || item.updated_at || 'Recently',
  }))

const normalizeDashboardStats = (response) => {
  const payload = response?.data || response || {}
  const recentApplications = payload.recent_applications || payload.recentApplications || []

  return {
    todaysCalls: payload.todaysCalls || payload.total_calls || payload.total_farmers_benefited || 0,
    applicationsProcessed:
      payload.applicationsProcessed || payload.total_applications || recentApplications.length || 0,
    amountUnlocked: payload.amountUnlocked || formatAmount(payload.total_farmers_benefited || 0),
    approvalRate: payload.approvalRate || payload.approval_rate || 'N/A',
    languageBreakdown: payload.languageBreakdown || [],
    recentActivities: normalizeActivities(recentApplications),
  }
}

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
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': filters?.language || 'hi' },
      })
      const normalized = normalizeDashboardStats(response)

      console.log('Dashboard stats fetched:', response)
      
      return {
        data: normalized,
        source: 'api',
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
      const response = await apiClient.get(url)
      const stats = normalizeDashboardStats(response)

      return {
        data: stats.recentActivities,
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
        API_ENDPOINTS.DASHBOARD.CHART_DATA.replace(':metric', metric)
      )
      const response = await apiClient.get(url)
      const stats = normalizeDashboardStats(response)

      if (metric === 'language') {
        return {
          data: stats.languageBreakdown,
          source: 'api',
        }
      }

      return {
        data: stats.recentActivities,
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
      const apiHost = new URL(API_CONFIG.BASE_URL).host
      const url = `${protocol}//${apiHost}${API_ENDPOINTS.DASHBOARD.LIVE_UPDATES}`
      
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
