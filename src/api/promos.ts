import { API_BASE } from '../constants/api'
import type { CategoryResponse, PromoDetail, PromoResponse } from '../types/promo'

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

export const fetchPromoDetail = async (promoId: number, signal: AbortSignal): Promise<PromoDetail> => {
  const response = await fetch(`${API_BASE}/get_web_card_promo?id=${promoId}`, {
    method: 'GET',
    signal,
  })

  if (!response.ok) {
    throw new Error('Unable to fetch promotion details at the moment.')
  }

  return response.json()
}
