/**
 * Loan Service
 * Handles loan options and calculator data retrieval
 */

import { API_ENDPOINTS, buildURL } from './apiConfig'
import { getMockLoanOptions } from './mockData'
import apiClient from './apiClient'

const FALLBACK_NEARBY_OFFERS = [
  {
    id: 'sbi-rural',
    bankName: 'State Bank of India',
    branch: 'Rural Branch',
    distanceKm: 2.1,
    annualInterestRate: 7.2,
    tenureMonths: 48,
    processingFeePercent: 1.0,
    minAmount: 50000,
    maxAmount: 1200000,
    prepayment: 'Allowed after 12 months',
    documents: ['Aadhaar Card', 'PAN Card', 'Land/Income Proof', 'Bank Statement (6 months)', 'Passport Size Photo'],
    address: 'Main Road Branch',
    contactPhone: '+91-00000-00001',
    managerName: 'Loan Desk',
    workingHours: 'Mon-Sat 10:00 AM - 4:00 PM',
  },
  {
    id: 'pnb-kisan',
    bankName: 'Punjab National Bank',
    branch: 'Kisan Seva Branch',
    distanceKm: 3.4,
    annualInterestRate: 7.8,
    tenureMonths: 60,
    processingFeePercent: 0.8,
    minAmount: 75000,
    maxAmount: 1500000,
    prepayment: 'Allowed with nominal fee',
    documents: ['Aadhaar Card', 'Address Proof', 'Income Certificate', 'Land Records', '2 Guarantor References'],
    address: 'Agriculture Service Point',
    contactPhone: '+91-00000-00002',
    managerName: 'Credit Officer',
    workingHours: 'Mon-Sat 10:00 AM - 4:00 PM',
  },
  {
    id: 'bob-agri',
    bankName: 'Bank of Baroda',
    branch: 'Agri Credit Desk',
    distanceKm: 4.2,
    annualInterestRate: 8.1,
    tenureMonths: 36,
    processingFeePercent: 0.75,
    minAmount: 100000,
    maxAmount: 1000000,
    prepayment: 'No penalty after 24 EMIs',
    documents: ['Aadhaar + PAN', 'Farmer ID/KCC Details', 'Last 1 year passbook', 'Crop/Business Plan', 'Photograph'],
    address: 'Market Yard Branch',
    contactPhone: '+91-00000-00003',
    managerName: 'Agri Loan Cell',
    workingHours: 'Mon-Sat 10:00 AM - 4:00 PM',
  },
]

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeNearbyOffer(item, index) {
  const interestGuess = toNumber(item?.annualInterestRate ?? item?.annual_interest_rate ?? item?.interestRate ?? item?.interest)
  const tenureGuess = toNumber(item?.tenureMonths ?? item?.tenure_months ?? item?.tenure)
  const processingFeeGuess = toNumber(item?.processingFeePercent ?? item?.processing_fee_percent ?? item?.processingFee)

  return {
    id: item?.id || item?.loan_id || `nearby-${index + 1}`,
    bankName: item?.bankName || item?.bank_name || item?.bank || item?.name || 'Bank',
    branch: item?.branch || item?.branchName || item?.branch_name || item?.office || 'Nearby Branch',
    distanceKm: toNumber(item?.distanceKm ?? item?.distance_km ?? item?.distance, 0),
    annualInterestRate: interestGuess > 0 ? interestGuess : 8.5,
    tenureMonths: tenureGuess > 0 ? tenureGuess : 36,
    processingFeePercent: processingFeeGuess >= 0 ? processingFeeGuess : 0.5,
    minAmount: toNumber(item?.minAmount ?? item?.min_amount ?? item?.minimumAmount, 50000),
    maxAmount: toNumber(item?.maxAmount ?? item?.max_amount ?? item?.maximumAmount, 1000000),
    prepayment: item?.prepayment || item?.prepayment_policy || item?.prepaymentRule || 'As per bank policy',
    documents: Array.isArray(item?.documents)
      ? item.documents
      : Array.isArray(item?.documents_required)
        ? item.documents_required
        : ['Aadhaar Card', 'Address Proof', 'Income/Land Proof'],
    address: item?.address || item?.fullAddress || null,
    contactPhone: item?.contactPhone || item?.contact_phone || item?.phone || null,
    managerName: item?.managerName || item?.manager_name || item?.officer || null,
    website: item?.website || item?.url || null,
    workingHours: item?.workingHours || item?.hours || null,
    aiSummary: item?.aiSummary || item?.summary || null,
  }
}

function normalizeLoanOptionsResponse(data) {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.loans) && data.loans) ||
    (Array.isArray(data?.data) && data.data) ||
    []

  return raw.map((item, index) => {
    const normalizedNearby = normalizeNearbyOffer(item, index)
    return {
      ...normalizedNearby,
      title: item?.title || `${normalizedNearby.bankName} - ${normalizedNearby.branch}`,
      detail: item?.detail || item?.loan_type || 'Agricultural loan option',
      amount: item?.amount || `Rs ${normalizedNearby.minAmount.toLocaleString('en-IN')} - Rs ${normalizedNearby.maxAmount.toLocaleString('en-IN')}`,
      interest: item?.interest || `${normalizedNearby.annualInterestRate}%`,
      tenure: item?.tenure || `${normalizedNearby.tenureMonths} months`,
      eligibility: item?.eligibility || 'As per bank policy',
    }
  })
}

function normalizeNearbyResponse(data) {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.banks) && data.banks) ||
    (Array.isArray(data?.offers) && data.offers) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    []

  return raw.map(normalizeNearbyOffer)
}

class LoanService {
  /**
   * Get loan options
   * @param {String} language - Language code for localization
   * @param {String} loanType - Optional filter by loan type
   * @returns {Object} { data: Array, source: 'api'|'mock' }
   */
  async getLoanOptions(language = 'hi', loanType = null) {
    try {
      console.log('Fetching loan options from API...')

      const url = buildURL(API_ENDPOINTS.LOANS?.LIST || '/api/loans')
      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
        params: loanType ? { type: loanType } : {},
      })

      console.log('Loan options fetched successfully:', response)
      return {
        data: response.loans || response.nearby_loans || response.results || response.data || response,
        source: response.source || 'api',
      }
    } catch (error) {
      console.warn('Loan API failed, using mock data:', error.message)

      return {
        data: getMockLoanOptions(language),
        source: 'mock',
      }
    }
  }

  /**
   * Get nearby bank loan comparison using location-aware backend AI
   * @param {String} language - Language code
   * @param {Object} context - User/location context
   * @returns {Object} { data: Array, source: 'ai'|'mock' }
   */
  async getNearbyLoanComparisons(language = 'hi', context = {}) {
    const { location = null, profile = null, requestedAmount = 200000 } = context

    try {
      console.log('Fetching nearby loan comparisons from AI backend...')

      const url = buildURL(API_ENDPOINTS.AI.NEARBY_LOANS)
      const response = await apiClient.post(
        url,
        {
          language,
          requestedAmount,
          location,
          profile,
          audience: 'farmers',
          includeBankDetails: true,
          maxItems: 8,
        },
        {
          headers: { 'Accept-Language': language },
        },
      )

      const normalized = normalizeNearbyResponse(response)
      if (normalized.length === 0) {
        throw new Error('No nearby loan offers in AI response')
      }

      return {
        data: normalized,
        source: 'ai',
      }
    } catch (error) {
      console.warn('Nearby loan AI API failed, trying standard nearby loans API:', error.message)

      try {
        const fallbackApiUrl = buildURL(API_ENDPOINTS.LOANS?.NEARBY || '/api/loans/nearby')
        const fallbackApiResponse = await apiClient.post(
          fallbackApiUrl,
          {
            language,
            requestedAmount,
            location,
            profile,
            includeBankDetails: true,
            maxItems: 8,
          },
          {
            headers: { 'Accept-Language': language },
          },
        )

        const normalized = normalizeNearbyResponse(fallbackApiResponse)
        if (normalized.length > 0) {
          return {
            data: normalized,
            source: 'api',
          }
        }
      } catch (fallbackError) {
        console.warn('Nearby standard API also failed, using hard fallback:', fallbackError.message)
      }

      return {
        data: FALLBACK_NEARBY_OFFERS,
        source: 'mock',
      }
    }
  }

  /**
   * Calculate loan EMI
   * @param {Number} amount   - Loan amount
   * @param {Number} interest - Annual interest rate
   * @param {Number} tenure   - Tenure in months
   * @returns {Object} { data: Object, source: 'calculated' }
   */
  async calculateEMI(amount, interest, tenure) {
    try {
      console.log('Calculating EMI from API...')

      const url = buildURL(API_ENDPOINTS.LOANS?.CALCULATE || '/api/loans/calculate')
      const response = await apiClient.post(url, { amount, interest, tenure })

      console.log('EMI calculated successfully:', response)
      return { data: response, source: 'api' }
    } catch (error) {
      console.warn('EMI calculation API failed, using local calculation:', error.message)

      const monthlyRate = (interest / 100) / 12
      const emi =
        (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1)
      const totalAmount = emi * tenure
      const totalInterest = totalAmount - amount

      return {
        data: {
          emi: Math.round(emi),
          totalAmount: Math.round(totalAmount),
          totalInterest: Math.round(totalInterest),
          principal: amount,
          tenure,
          interest,
        },
        source: 'calculated',
      }
    }
  }
}

export default new LoanService()

