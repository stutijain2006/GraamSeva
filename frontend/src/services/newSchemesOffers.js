/**
 * New Schemes & Offers Service
 */

import { API_ENDPOINTS, buildURL } from './apiConfig'
import { getMockLatestOffers } from './mockData'
import apiClient from './apiClient'

function normalizeUpdateItem(item, index) {
  return {
    id: item.id ?? `ai-${index + 1}`,
    title: item.title || item.headline || item.name || 'Government Update',
    desc: item.desc || item.description || item.summary || '',
    badge: item.badge || item.category || 'Update',
    date: item.date || item.publishedAt || item.published_on || '',
    type: item.type || item.updateType || 'update',
    url: item.url || item.link || null,
  }
}

function normalizeResponse(data) {
  const rawItems =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.updates) && data.updates) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    []

  return rawItems.map(normalizeUpdateItem)
}

class NewSchemesOffersService {
  async getNewSchemes(language = 'hi', context = {}) {
    const { profile = {}, location = null } = context

    try {
      console.log('Fetching AI-generated recent farmer government updates...')

      const aiUrl = buildURL(API_ENDPOINTS.AI.HOME_UPDATES)
      const aiResponse = await apiClient.post(
        aiUrl,
        {
          language,
          maxItems: 10,
          scope: 'india',
          audience: 'farmers',
          topic: 'recent government schemes and policy updates for farmers relevant to GraamSeva users',
          currentDate: new Date().toISOString().slice(0, 10),
          profile: {
            name: profile?.name || null,
            mobile: profile?.mobile || null,
            language: profile?.language || language,
          },
          location,
        },
        {
          headers: { 'Accept-Language': language },
        },
      )

      const normalized = normalizeResponse(aiResponse)
      if (normalized.length > 0) {
        return {
          data: normalized,
          source: 'ai',
        }
      }

      throw new Error('AI response did not include updates')
    } catch (aiError) {
      console.warn('AI home updates failed, trying standard updates API:', aiError.message)

      try {
        const url = buildURL(API_ENDPOINTS.NEW_SCHEMES.LIST)
        const response = await apiClient.get(url, {
          headers: { 'Accept-Language': language },
        })

        const normalized = normalizeResponse(response)
        return {
          data: normalized,
          source: 'api',
        }
      } catch (error) {
        console.warn('New schemes API failed, using mock data:', error.message)

        return {
          data: getMockLatestOffers(language),
          source: 'mock',
        }
      }
    }
  }
}

export default new NewSchemesOffersService()
