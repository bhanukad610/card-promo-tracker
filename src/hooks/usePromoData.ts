import { useEffect, useMemo, useState } from 'react'
import { fetchCategories, fetchPromosByCategory } from '../api/promos'
import type { Category, Promo } from '../types/promo'
import { formatCategoryName } from '../utils/formatters'

export const usePromoData = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [promos, setPromos] = useState<Promo[]>([])
  const [promoPage, setPromoPage] = useState(1)
  const [promoTotal, setPromoTotal] = useState(0)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingPromos, setLoadingPromos] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadCategories = async () => {
      setLoadingCategories(true)
      setError(null)

      try {
        const categoryJson = await fetchCategories(controller.signal)
        const sortedCategories = [...categoryJson.data].sort((a, b) =>
          a.order === b.order ? a.category.localeCompare(b.category) : a.order - b.order,
        )

        setCategories(sortedCategories)
        setSelectedCategoryId((prev) => prev ?? sortedCategories[0]?.id ?? null)
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
          setError('Failed to load categories. Please refresh and try again.')
        }
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (selectedCategoryId === null) {
      return
    }

    const controller = new AbortController()

    const loadPromosForCategory = async () => {
      setLoadingPromos(true)
      setError(null)

      try {
        const promoJson = await fetchPromosByCategory(selectedCategoryId, controller.signal)
        setPromos(promoJson.data)
        setPromoPage(promoJson.page)
        setPromoTotal(promoJson.total)
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
          setError('Failed to load promotions. Please try another category.')
        }
      } finally {
        setLoadingPromos(false)
      }
    }

    loadPromosForCategory()

    return () => controller.abort()
  }, [selectedCategoryId])

  const selectedCategoryName = useMemo(
    () =>
      formatCategoryName(
        categories.find((category) => category.id === selectedCategoryId)?.category ??
          'Selected Category',
      ),
    [categories, selectedCategoryId],
  )

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    promos,
    promoPage,
    promoTotal,
    loadingCategories,
    loadingPromos,
    error,
    selectedCategoryName,
  }
}
