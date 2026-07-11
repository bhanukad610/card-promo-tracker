import { useState } from 'react'
import { CategorySection } from '../../components/CategorySection'
import { PromoDetailModal } from '../../components/PromoDetailModal'
import { PromoSection } from '../../components/PromoSection'
import { usePromoData } from '../../hooks/usePromoData'
import { useSavedPromos } from '../../hooks/useSavedPromos'
import { useTheme } from '../../hooks/useTheme'
import styles from './HomePage.module.css'

function HomePage() {
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null)
  const [showSavedOffers, setShowSavedOffers] = useState(false)
  const { isDarkMode, toggleDarkMode } = useTheme()

  const {
    banks,
    selectedBank,
    selectedBankId,
    setSelectedBankId,
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
    canSearchPromos,
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

  return (
    <main className={`${styles.page} ${isDarkMode ? styles.darkMode : ''}`}>
      <header className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <h1>Card Promotions</h1>
          <button
            className={styles.themeToggleButton}
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
        </div>
      </header>

      {!loadingCategories && !error && (
        <section className={styles.pageContent}>
          <CategorySection
            banks={banks}
            selectedBankId={selectedBankId}
            onSelectBank={(bankId) => {
              setShowSavedOffers(false)
              setSelectedBankId(bankId)
            }}
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
              selectedBankName={selectedBank.shortName}
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
              searchDisabled={!canSearchPromos}
              onSearchTextChange={setSearchText}
              onSearchStartDateChange={setSearchStartDate}
              onSearchEndDateChange={setSearchEndDate}
              onClearSearchFilters={clearSearchFilters}
              onSearch={() => {
                if (!canSearchPromos) {
                  return
                }

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
          isSaved={selectedPromo ? savedPromoIds.has(selectedPromoId) : false}
          onToggleSaved={selectedPromo ? () => toggleSavedPromo(selectedPromo) : undefined}
          onClose={() => setSelectedPromoId(null)}
        />
      )}
    </main>
  )
}

export default HomePage
