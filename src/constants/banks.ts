import type { Bank } from '../types/promo'

export const BANKS: Bank[] = [
  {
    id: 'hnb',
    name: 'HNB',
    shortName: 'HNB',
    apiBase: 'https://venus.hnb.lk/api',
    fileBase: 'https://assets.hnb.lk/atdi/',
    supportsSearch: true,
  },
]

export const DEFAULT_BANK_ID = BANKS[0].id
