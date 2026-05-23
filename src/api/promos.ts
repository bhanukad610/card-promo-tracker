import { API_BASE } from '../constants/api'
import type { CategoryResponse, PromoResponse } from '../types/promo'

export const fetchCategories = async (signal: AbortSignal): Promise<CategoryResponse> => {
  const response = await fetch(`${API_BASE}/get_all_card_promotion_categories`, {
    method: 'GET',
    signal,
  })

  if (!response.ok) {
    throw new Error('Unable to fetch categories at the moment.')
  }

  return response.json()
}

export const fetchPromosByCategory = async (
  categoryId: number,
  page: number,
  signal: AbortSignal,
): Promise<PromoResponse> => {
  const response = await fetch(
    `${API_BASE}/get_all_web_card_promos?cat=${categoryId}&page=${page}&cardType=Credit`,
    {
      method: 'GET',
      signal,
    },
  )

  if (!response.ok) {
    throw new Error('Unable to fetch promotions at the moment.')
  }

  return response.json()
}
