import { useMemo, useState } from 'react'
import './App.css'
import { CategorySection } from './components/CategorySection'
import { PromoDetailModal } from './components/PromoDetailModal'
import { PromoSection } from './components/PromoSection'
import { usePromoData } from './hooks/usePromoData'

type CardTypeFilter = 'all' | 'credit' | 'debit'

function App() {
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null)
  const [selectedCardType, setSelectedCardType] = useState<CardTypeFilter>('all')
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

  const filteredPromos = useMemo(() => {
    if (selectedCardType === 'all') {
      return promos
    }

    return promos.filter((promo) => promo.cardType.toLowerCase() === selectedCardType)
  }, [promos, selectedCardType])

  const isLoading = loadingCategories || (selectedCategoryId !== null && loadingPromos)

  return (
    <main className="page">
      <header className="page-header">
        <h1>HNB Card Promotions</h1>
      </header>

      {!loadingCategories && !error && (
        <section className="content-layout">
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
              promos={filteredPromos}
              selectedCardType={selectedCardType}
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
