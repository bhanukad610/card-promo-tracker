import { BANKS } from '../constants/banks'
import type { Bank, BankId, CategoryResponse, Promo, PromoDetail, PromoResponse, PromoSearchParams } from '../types/promo'

const getBank = (bankId: BankId): Bank => BANKS.find((bank) => bank.id === bankId) ?? BANKS[0]

const getCompositePromoId = (bankId: BankId, rawId: number) => `${bankId}:${rawId}`

type HnbCategory = {
  id: number
  category: string
  order: number
}

type HnbCategoryResponse = {
  status: number
  data: HnbCategory[]
}

type HnbPromo = {
  id: number
  title: string
  thumb: string
  merchant: string
  cardType: string
  to: string
  valid: string
}

type HnbPromoResponse = Omit<PromoResponse, 'data'> & {
  data: HnbPromo[]
}

const normalizeHnbPromo = (promo: HnbPromo): Promo => ({
  ...promo,
  id: getCompositePromoId('hnb', promo.id),
  rawId: promo.id,
  bankId: 'hnb',
})

export const fetchCategories = async (bankId: BankId, signal: AbortSignal): Promise<CategoryResponse> => {
  const bank = getBank(bankId)

  const response = await fetch(`${bank.apiBase}/get_all_card_promotion_categories`, {
    method: 'GET',
    signal,
  })

  if (!response.ok) {
    throw new Error('Unable to fetch categories at the moment.')
  }

  const json = (await response.json()) as HnbCategoryResponse
  return {
    status: json.status,
    data: json.data.map((category) => ({
      ...category,
      id: String(category.id),
      bankId: 'hnb',
    })),
  }
}

export const fetchPromosByCategory = async (
  bankId: BankId,
  categoryId: string,
  page: number,
  cardType: 'All' | 'Credit' | 'Debit',
  signal: AbortSignal,
): Promise<PromoResponse> => {
  const bank = getBank(bankId)

  const response = await fetch(
    `${bank.apiBase}/get_all_web_card_promos?cat=${categoryId}&page=${page}&cardType=${cardType}`,
    {
      method: 'GET',
      signal,
    },
  )

  if (!response.ok) {
    throw new Error('Unable to fetch promotions at the moment.')
  }

  const json = (await response.json()) as HnbPromoResponse
  return {
    ...json,
    data: json.data.map(normalizeHnbPromo),
  }
}

export const fetchPromoDetail = async (bankId: BankId, promoId: string, signal?: AbortSignal): Promise<PromoDetail> => {
  const bank = getBank(bankId)
  const rawPromoId = promoId.split(':').at(-1) ?? promoId

  const response = await fetch(`${bank.apiBase}/get_web_card_promo?id=${rawPromoId}`, {
    method: 'GET',
    signal,
  })

  if (!response.ok) {
    throw new Error('Unable to fetch promotion details at the moment.')
  }

  return response.json()
}

export const searchPromos = async (
  bankId: BankId,
  payload: PromoSearchParams,
  signal: AbortSignal,
): Promise<PromoResponse> => {
  const bank = getBank(bankId)

  const response = await fetch(`${bank.apiBase}/search_card_promotions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    throw new Error('Unable to search promotions at the moment.')
  }

  const json = (await response.json()) as HnbPromoResponse
  return {
    ...json,
    data: json.data.map(normalizeHnbPromo),
  }
}
