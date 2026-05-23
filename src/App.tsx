import './App.css'
import { CategorySection } from './components/CategorySection'
import { PromoSection } from './components/PromoSection'
import { usePromoData } from './hooks/usePromoData'

function App() {
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
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
  } = usePromoData()

  const isLoading = loadingCategories || (selectedCategoryId !== null && loadingPromos)

  return (
    <main className="page">
      <header className="page-header">
        <h1>HNB Card Promotions</h1>
      </header>

      {!loadingCategories && !error && (
        <>
          <CategorySection
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
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
              promos={promos}
            />
          )}
        </>
      )}
    </main>
  )
}

export default App
