import { useEffect, useState } from 'react'
import './App.css'
import { CategorySection } from './components/CategorySection'
import { PromoDetailModal } from './components/PromoDetailModal'
import { PromoSection } from './components/PromoSection'
import { usePromoData } from './hooks/usePromoData'

function App() {
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null)
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

  const isLoading = loadingCategories || (selectedCategoryId !== null && loadingPromos)

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
            onSelectCategory={setSelectedCategoryId}
            selectedCardType={selectedCardType}
            onSelectCardType={setSelectedCardType}
          />
          {!error && (
          <PromoSection
              selectedCategoryName={selectedCategoryName}
              isLoading={isLoading}
              promoTotal={promoTotal}
              promoPage={promoPage}
              promoTotalPages={promoTotalPages}
              canLoadMorePromos={canLoadMorePromos}
              onLoadMorePromos={loadMorePromos}
              onOpenPromoDetail={setSelectedPromoId}
              promos={promos}
              searchText={searchText}
              searchStartDate={searchStartDate}
              searchEndDate={searchEndDate}
              isSearchMode={isSearchMode}
              onSearchTextChange={setSearchText}
              onSearchStartDateChange={setSearchStartDate}
              onSearchEndDateChange={setSearchEndDate}
              onClearSearchFilters={clearSearchFilters}
              onSearch={() => {
                setActiveSearchText(searchText)
                setActiveSearchStartDate(searchStartDate)
                setActiveSearchEndDate(searchEndDate)
              }}
            />
          )}
        </section>
      )}
      {selectedPromoId !== null && (
        <PromoDetailModal promoId={selectedPromoId} onClose={() => setSelectedPromoId(null)} />
      )}
    </main>
  )
}

export default App
