import { API_ENDPOINTS, buildURL } from './apiConfig'
import apiClient from './apiClient'

export const generateChatResponse = async (query, language = 'en', context = {}) => {
  const response = await apiClient.post(buildURL(API_ENDPOINTS.AI.CHAT), {
    query,
    language,
    context,
  })

  return {
    message: response.message || 'I could not process your request.',
    speak: response.speak || response.message || 'I could not process your request.',
    redirect: response.redirect || 'home',
    result: response.result || { items: [] },
    source: response.source || 'api',
  }
}
