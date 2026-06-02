export type BankId = 'hnb' | 'sampath'

export type Bank = {
  id: BankId
  name: string
  shortName: string
  apiBase: string
  fileBase?: string
  supportsSearch: boolean
}

export type Category = {
  id: string
  category: string
  order: number
  bankId: BankId
}

export type CategoryResponse = {
  status?: number
  data: Category[]
}

export type Promo = {
  id: string
  rawId: number
  bankId: BankId
  title: string
  thumb: string
  merchant: string
  cardType: string
  to: string
  valid: string
  detail?: PromoDetail
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
