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
  totalPages: number
  total: number
  data: Promo[]
}
