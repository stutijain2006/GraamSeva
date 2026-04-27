/**
 * New Schemes & Offers Service
 */

import { API_ENDPOINTS, buildURL } from './apiConfig'
import apiClient from './apiClient'

const cacheKey = (language) => `graamseva_home_updates_${language}`

function readCachedUpdates(language) {
  try {
    const raw = localStorage.getItem(cacheKey(language))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.data) ? parsed.data : []
  } catch {
    return []
  }
}

function writeCachedUpdates(language, data) {
  try {
    localStorage.setItem(cacheKey(language), JSON.stringify({
      data,
      savedAt: new Date().toISOString(),
    }))
  } catch {
    // Ignore storage failures; live API remains the source of truth.
  }
}

function normalizeUpdateItem(item, index) {
  const governmentLevel = item.governmentLevel || item.government_level || 'Government'
  const title = item.title || item.headline || item.name || ''
  const descRaw = item.desc || item.description || item.details || item.summary || ''
  const desc = String(descRaw || '').trim() || String(title || '').trim()
  return {
    id: item.id ?? item.scheme_id ?? `ai-${index + 1}`,
    title: title || 'Government Update',
    desc,
    badge: item.badge || item.category || governmentLevel,
    date: item.date || item.publishedAt || item.published_on || item.updated_at || '',
    type: item.type || item.updateType || 'update',
    url: item.url || item.link || null,
    sourceName: item.sourceName || item.source_name || item.source || '',
  }
}

function normalizeResponse(data) {
  const rawItems =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.schemes) && data.schemes) ||
    (Array.isArray(data?.results) && data.results) ||
    (Array.isArray(data?.updates) && data.updates) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    []

  return rawItems
    .map(normalizeUpdateItem)
    .filter((item) => String(item.title || '').trim().length > 0 && String(item.desc || '').trim().length > 0)
}

class NewSchemesOffersService {
  async getNewSchemes(language = 'hi', context = {}) {
    const { profile = {}, location = null } = context

    try {
      console.log('Fetching latest scheme updates from API...')

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
          timeout: 45000,
        },
      )

      const normalized = normalizeResponse(aiResponse)
      if (normalized.length > 0) {
        writeCachedUpdates(language, normalized)
        return {
          data: normalized,
          source: aiResponse.source || 'verified-government-sources',
          lastFetched: aiResponse.lastFetched || null,
          refreshAfterSeconds: aiResponse.refreshAfterSeconds || null,
        }
      }

      return {
        data: readCachedUpdates(language),
        source: aiResponse.source || 'verified-government-sources',
        lastFetched: aiResponse.lastFetched || null,
        refreshAfterSeconds: aiResponse.refreshAfterSeconds || null,
      }
    } catch (aiError) {
      console.warn('Verified government updates API failed:', aiError.message)

      return {
        data: readCachedUpdates(language),
        source: 'unavailable',
      }
    }
  }
}

export default new NewSchemesOffersService()
