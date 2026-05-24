export type Category = {
  id: number
  category: string
  order: number
}

export type CategoryResponse = {
  status: number
  data: Category[]
}

export type Promo = {
  id: number
  title: string
  thumb: string
  merchant: string
  cardType: string
  to: string
  valid: string
}

export type PromoResponse = {
  page: number
  limit?: number
  totalPages: number
  total: number
  data: Promo[]
}

export type PromoSearchParams = {
  query?: string
  startDate?: string
  endDate?: string
  cardType?: 'credit' | 'debit'
  page: number
  limit: number
}

export type PromoDetail = {
  title: string
  thumb: string
  from: string
  to: string
  valid: string
  cardType: string
  content: string
  merchant: string
  assets: string[]
}
