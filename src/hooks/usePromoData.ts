import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCategories, fetchPromosByCategory, searchPromos } from '../api/promos'
import type { Category, Promo, PromoSearchParams } from '../types/promo'
import { formatCategoryName } from '../utils/formatters'

const SEARCH_PAGE_SIZE = 12

const formatDate = (date: Date) => date.toISOString().split('T')[0]

export const usePromoData = () => {
  const [selectedCardType, setSelectedCardType] = useState<'All' | 'Credit' | 'Debit'>('All')
  const [searchText, setSearchText] = useState('')
  const [searchStartDate, setSearchStartDate] = useState(formatDate(new Date()))
  const [searchEndDate, setSearchEndDate] = useState(formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)))
  const [activeSearchText, setActiveSearchText] = useState('')
  const [activeSearchStartDate, setActiveSearchStartDate] = useState(searchStartDate)
  const [activeSearchEndDate, setActiveSearchEndDate] = useState(searchEndDate)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [promos, setPromos] = useState<Promo[]>([])
  const [promoPage, setPromoPage] = useState(1)
  const [promoTotalPages, setPromoTotalPages] = useState(1)
  const [promoTotal, setPromoTotal] = useState(0)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingPromos, setLoadingPromos] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizedSearchText = activeSearchText.trim().toLowerCase()
  const isSearchMode = normalizedSearchText.length > 0 || Boolean(activeSearchStartDate) || Boolean(activeSearchEndDate)

  const buildSearchPayload = useCallback(
    (page: number): PromoSearchParams => ({
      query: normalizedSearchText || undefined,
      startDate: activeSearchStartDate || undefined,
      endDate: activeSearchEndDate || undefined,
      cardType: selectedCardType === 'All' ? undefined : (selectedCardType.toLowerCase() as 'credit' | 'debit'),
      page,
      limit: SEARCH_PAGE_SIZE,
    }),
    [activeSearchEndDate, activeSearchStartDate, normalizedSearchText, selectedCardType],
  )

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
    if (!isSearchMode && selectedCategoryId === null) {
      return
    }

    const controller = new AbortController()

    const loadPromos = async () => {
      setLoadingPromos(true)
      setError(null)

      try {
        const promoJson = isSearchMode
          ? await searchPromos(buildSearchPayload(1), controller.signal)
          : await fetchPromosByCategory(selectedCategoryId as number, 1, selectedCardType, controller.signal)

        setPromos(promoJson.data)
        setPromoPage(promoJson.page)
        setPromoTotalPages(promoJson.totalPages)
        setPromoTotal(promoJson.total)
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
          setError(
            isSearchMode
              ? 'Failed to search promotions. Please try another keyword.'
              : 'Failed to load promotions. Please try another category.',
          )
        }
      } finally {
        setLoadingPromos(false)
      }
    }

    loadPromos()

    return () => controller.abort()
  }, [buildSearchPayload, isSearchMode, selectedCategoryId, selectedCardType])

  const canLoadMorePromos = promoPage < promoTotalPages

  const loadMorePromos = useCallback(async () => {
    if ((selectedCategoryId === null && !isSearchMode) || loadingPromos || !canLoadMorePromos) {
      return
    }

    const controller = new AbortController()
    setLoadingPromos(true)

    try {
      const nextPage = promoPage + 1
      const promoJson = isSearchMode
        ? await searchPromos(buildSearchPayload(nextPage), controller.signal)
        : await fetchPromosByCategory(
            selectedCategoryId as number,
            nextPage,
            selectedCardType,
            controller.signal,
          )

      setPromos((currentPromos) => [...currentPromos, ...promoJson.data])
      setPromoPage(promoJson.page)
      setPromoTotalPages(promoJson.totalPages)
      setPromoTotal(promoJson.total)
    } catch (loadError) {
      if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
        setError(
          isSearchMode
            ? 'Failed to load more search results. Please try again.'
            : 'Failed to load more promotions. Please try again.',
        )
      }
    } finally {
      setLoadingPromos(false)
    }
  }, [buildSearchPayload, canLoadMorePromos, isSearchMode, loadingPromos, promoPage, selectedCategoryId, selectedCardType])

  const selectedCategoryName = useMemo(() => {
    if (isSearchMode) {
      return `Search results for "${activeSearchText.trim()}"`
    }

    return formatCategoryName(
      categories.find((category) => category.id === selectedCategoryId)?.category ?? 'Selected Category',
    )
  }, [activeSearchText, categories, isSearchMode, selectedCategoryId])

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedCardType,
    setSelectedCardType,
    promos,
    promoPage,
    promoTotalPages,
    promoTotal,
    canLoadMorePromos,
    loadMorePromos,
    loadingCategories,
    loadingPromos,
    error,
    selectedCategoryName,
    searchText,
    setSearchText,
    searchStartDate,
    setSearchStartDate,
    searchEndDate,
    setSearchEndDate,
    activeSearchText,
    setActiveSearchText,
    setActiveSearchStartDate,
    setActiveSearchEndDate,
    isSearchMode,
  }
}
