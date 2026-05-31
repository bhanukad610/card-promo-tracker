import { useCallback, useMemo, useState } from 'react'
import type { Promo } from '../types/promo'

const SAVED_PROMOS_STORAGE_KEY = 'saved-promos-v1'

const readSavedPromos = (): Promo[] => {
  const savedPromos = localStorage.getItem(SAVED_PROMOS_STORAGE_KEY)

  if (!savedPromos) {
    return []
  }

  try {
    const parsedPromos = JSON.parse(savedPromos)

    if (!Array.isArray(parsedPromos)) {
      return []
    }

    return parsedPromos.filter((promo): promo is Promo => {
      return (
        typeof promo === 'object' &&
        promo !== null &&
        typeof promo.id === 'number' &&
        typeof promo.title === 'string' &&
        typeof promo.thumb === 'string' &&
        typeof promo.merchant === 'string' &&
        typeof promo.cardType === 'string' &&
        typeof promo.to === 'string' &&
        typeof promo.valid === 'string'
      )
    })
  } catch {
    return []
  }
}

const writeSavedPromos = (promos: Promo[]) => {
  localStorage.setItem(SAVED_PROMOS_STORAGE_KEY, JSON.stringify(promos))
}

export const useSavedPromos = () => {
  const [savedPromos, setSavedPromos] = useState<Promo[]>(readSavedPromos)

  const savedPromoIds = useMemo(() => new Set(savedPromos.map((promo) => promo.id)), [savedPromos])

  const toggleSavedPromo = useCallback((promo: Promo) => {
    setSavedPromos((currentPromos) => {
      const isAlreadySaved = currentPromos.some((savedPromo) => savedPromo.id === promo.id)
      const nextPromos = isAlreadySaved
        ? currentPromos.filter((savedPromo) => savedPromo.id !== promo.id)
        : [promo, ...currentPromos]

      writeSavedPromos(nextPromos)
      return nextPromos
    })
  }, [])

  return {
    savedPromos,
    savedPromoIds,
    toggleSavedPromo,
  }
}
