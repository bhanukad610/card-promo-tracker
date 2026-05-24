import { useState } from 'react'
import './App.css'
import { CategorySection } from './components/CategorySection'
import { PromoDetailModal } from './components/PromoDetailModal'
import { PromoSection } from './components/PromoSection'
import { usePromoData } from './hooks/usePromoData'

function App() {
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null)
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
    isSearchMode,
  } = usePromoData()

  const isLoading = loadingCategories || (selectedCategoryId !== null && loadingPromos)

  return (
    <main className="page">
      <header className="page-header">
        <h1>HNB Card Promotions</h1>
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
