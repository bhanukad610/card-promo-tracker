import { useEffect, useState } from 'react'
import './App.css'
import { CategorySection } from './components/CategorySection'
import { PromoDetailModal } from './components/PromoDetailModal'
import { PromoSection } from './components/PromoSection'
import { usePromoData } from './hooks/usePromoData'
import { useSavedPromos } from './hooks/useSavedPromos'

function App() {
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null)
  const [showSavedOffers, setShowSavedOffers] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const {
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
    setActiveSearchText,
    setActiveSearchStartDate,
    setActiveSearchEndDate,
    clearSearchFilters,
    isSearchMode,
  } = usePromoData()
  const { savedPromos, savedPromoIds, toggleSavedPromo } = useSavedPromos()

  const displayedPromos = showSavedOffers ? savedPromos : promos
  const selectedPromo =
    displayedPromos.find((promo) => promo.id === selectedPromoId) ??
    promos.find((promo) => promo.id === selectedPromoId) ??
    savedPromos.find((promo) => promo.id === selectedPromoId)

  const displayPromoTotal = showSavedOffers ? savedPromos.length : promoTotal
  const displayPromoPage = showSavedOffers ? 1 : promoPage
  const displayPromoTotalPages = showSavedOffers ? 1 : promoTotalPages
  const isLoading = !showSavedOffers && (loadingCategories || (selectedCategoryId !== null && loadingPromos))

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return (
    <main className={`page ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="page-header">
        <div className="header-row">
          <h1>HNB Card Promotions</h1>
          <button
            className="theme-toggle-btn"
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
        </div>
      </header>

      {!loadingCategories && !error && (
        <section className="page-content">
          <CategorySection
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(categoryId) => {
              setShowSavedOffers(false)
              setSelectedCategoryId(categoryId)
            }}
            selectedCardType={selectedCardType}
            onSelectCardType={(cardType) => {
              setShowSavedOffers(false)
              setSelectedCardType(cardType)
            }}
          />
          {!error && (
            <PromoSection
              selectedCategoryName={selectedCategoryName}
              isLoading={isLoading}
              promoTotal={displayPromoTotal}
              promoPage={displayPromoPage}
              promoTotalPages={displayPromoTotalPages}
              canLoadMorePromos={!showSavedOffers && canLoadMorePromos}
              onLoadMorePromos={loadMorePromos}
              onOpenPromoDetail={setSelectedPromoId}
              promos={displayedPromos}
              savedPromoIds={savedPromoIds}
              savedOfferCount={savedPromos.length}
              isSavedView={showSavedOffers}
              onToggleSavedView={() => setShowSavedOffers((prev) => !prev)}
              onToggleSavedPromo={toggleSavedPromo}
              searchText={searchText}
              searchStartDate={searchStartDate}
              searchEndDate={searchEndDate}
              isSearchMode={isSearchMode}
              onSearchTextChange={setSearchText}
              onSearchStartDateChange={setSearchStartDate}
              onSearchEndDateChange={setSearchEndDate}
              onClearSearchFilters={clearSearchFilters}
              onSearch={() => {
                setShowSavedOffers(false)
                setActiveSearchText(searchText)
                setActiveSearchStartDate(searchStartDate)
                setActiveSearchEndDate(searchEndDate)
              }}
            />
          )}
        </section>
      )}
      {selectedPromoId !== null && (
        <PromoDetailModal
          promoId={selectedPromoId}
          promo={selectedPromo}
          isSaved={savedPromoIds.has(selectedPromoId)}
          onToggleSaved={selectedPromo ? () => toggleSavedPromo(selectedPromo) : undefined}
          onClose={() => setSelectedPromoId(null)}
        />
      )}
    </main>
  )
}

export default App
