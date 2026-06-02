import type { Bank } from '../types/promo'

export const BANKS: Bank[] = [
  {
    id: 'hnb',
    name: 'HNB',
    shortName: 'HNB',
    apiBase: 'https://venus.hnb.lk/api',
    fileBase: 'https://assets.hnb.lk/atdi/',
  },
  {
    id: 'sampath',
    name: 'Sampath Bank',
    shortName: 'Sampath',
    apiBase: 'https://www.sampath.lk/api',
  },
]

export const DEFAULT_BANK_ID = BANKS[0].id
