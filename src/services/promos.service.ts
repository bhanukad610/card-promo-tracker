import { BANKS } from '../constants/banks'
import type { Bank, BankId, Category, CategoryResponse, Promo, PromoDetail, PromoResponse, PromoSearchParams } from '../types/promo'

const SAMPATH_PAGE_SIZE = 8

const getBank = (bankId: BankId): Bank => BANKS.find((bank) => bank.id === bankId) ?? BANKS[0]

const getCompositePromoId = (bankId: BankId, rawId: number) => `${bankId}:${rawId}`

const stripHtml = (value?: string | null) =>
  (value ?? '')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const formatEpochDate = (value?: string | null) => {
  if (!value) return ''

  const timestamp = Number(value)
  if (!Number.isFinite(timestamp)) return ''

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp))
}

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

type SampathCategory = {
  id: number
  label: string
  value: string
  enable?: boolean
  delete_status?: boolean
  order_id?: string | number
}

type SampathCardInfo = {
  title: string
  description: string
  order_id?: number
}

type SampathPromo = {
  id: number
  image_url?: string | null
  company_name?: string | null
  description?: string | null
  category?: string | null
  city?: string | null
  promotion_details?: string | null
  terms_and_conditions?: string | null
  short_description?: string | null
  discounts?: string | null
  short_discount?: string | null
  display_on?: string | null
  expire_on?: string | null
  cards_new?: SampathCardInfo[]
}

type SampathPromoResponse = {
  data: SampathPromo[]
  page?: number
  page_number?: number
  totalPages?: number
  total_pages?: number
  total?: number
  count?: number
}

const normalizeHnbPromo = (promo: HnbPromo): Promo => ({
  ...promo,
  id: getCompositePromoId('hnb', promo.id),
  rawId: promo.id,
  bankId: 'hnb',
})

const normalizeSampathPromo = (promo: SampathPromo): Promo => {
  const cardInfo = [...(promo.cards_new ?? [])].sort((a, b) => (a.order_id ?? 0) - (b.order_id ?? 0))
  const cardInfoContent = cardInfo
    .map((item) => `<p><strong>${item.title}</strong><br>${item.description}</p>`)
    .join('')
  const promotionDetails = promo.promotion_details ?? ''
  const termsAndConditions = promo.terms_and_conditions ?? ''
  const description = promo.description ?? ''
  const discount = stripHtml(promo.short_discount || promo.discounts) || 'Offer'
  const to = formatEpochDate(promo.expire_on) || stripHtml(promotionDetails)
  const from = formatEpochDate(promo.display_on)
  const merchant = stripHtml(promo.company_name) || 'Sampath partner'
  const title = `${discount} at ${merchant}`

  const detail: PromoDetail = {
    title,
    thumb: promo.image_url ?? '',
    from,
    to,
    valid: to ? `Valid till ${to}` : stripHtml(promotionDetails),
    cardType: 'Sampath',
    content: [
      description && `<p>${description}</p>`,
      promotionDetails && `<h4>Promotion Details</h4><p>${promotionDetails}</p>`,
      cardInfoContent,
      termsAndConditions && `<h4>Terms & Conditions</h4><p>${termsAndConditions}</p>`,
    ]
      .filter(Boolean)
      .join(''),
    merchant,
    assets: promo.image_url ? [promo.image_url] : [],
  }

  return {
    id: getCompositePromoId('sampath', promo.id),
    rawId: promo.id,
    bankId: 'sampath',
    title,
    thumb: promo.image_url ?? '',
    merchant,
    cardType: 'Sampath',
    to,
    valid: detail.valid,
    detail,
  }
}

export const fetchCategories = async (bankId: BankId, signal: AbortSignal): Promise<CategoryResponse> => {
  const bank = getBank(bankId)

  if (bankId === 'sampath') {
    const response = await fetch(`${bank.apiBase}/offer-catergories`, { method: 'GET', signal })

    if (!response.ok) {
      throw new Error('Unable to fetch Sampath categories at the moment.')
    }

    const data = (await response.json()) as SampathCategory[]
    const categories = data
      .filter((category) => category.enable !== false && category.delete_status !== true)
      .map<Category>((category) => ({
        id: category.value,
        category: category.label || category.value,
        order: Number(category.order_id ?? category.id),
        bankId: 'sampath',
      }))

    return { data: categories }
  }

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

  if (bankId === 'sampath') {
    const response = await fetch(
      `${bank.apiBase}/card-promotions?category=${encodeURIComponent(categoryId)}&page_number=${page}&size=${SAMPATH_PAGE_SIZE}`,
      { method: 'GET', signal },
    )

    if (!response.ok) {
      throw new Error('Unable to fetch Sampath promotions at the moment.')
    }

    const json = (await response.json()) as SampathPromoResponse
    const promos = (json.data ?? []).map(normalizeSampathPromo)
    const total =
      json.total ??
      json.count ??
      (promos.length < SAMPATH_PAGE_SIZE ? (page - 1) * SAMPATH_PAGE_SIZE + promos.length : page * SAMPATH_PAGE_SIZE + 1)
    const totalPages = json.totalPages ?? json.total_pages ?? (promos.length < SAMPATH_PAGE_SIZE ? page : page + 1)

    return {
      page: json.page ?? json.page_number ?? page,
      limit: SAMPATH_PAGE_SIZE,
      totalPages,
      total,
      data: promos,
    }
  }

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

  if (bankId === 'sampath') {
    throw new Error('Sampath promotion details are included in the listing response.')
  }

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

  if (bankId === 'sampath') {
    throw new Error('Sampath does not support promotion search.')
  }

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
