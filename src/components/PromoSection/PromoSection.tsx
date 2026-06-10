import { PromoCard } from '../PromoCard'
import { SearchFilters } from '../SearchFilters'
import styles from './PromoSection.module.css'
import type { Promo } from '../../types/promo'

type PromoSectionProps = {
  selectedBankName: string
  selectedCategoryName: string
  isLoading: boolean
  promoTotal: number
  promoPage: number
  promoTotalPages: number
  canLoadMorePromos: boolean
  onLoadMorePromos: () => void
  onOpenPromoDetail: (promoId: string) => void
  promos: Promo[]
  savedPromoIds: Set<string>
  savedOfferCount: number
  isSavedView: boolean
  onToggleSavedView: () => void
  onToggleSavedPromo: (promo: Promo) => void
  searchText: string
  searchStartDate: string
  searchEndDate: string
  isSearchMode: boolean
  searchDisabled: boolean
  onSearchTextChange: (value: string) => void
  onSearchStartDateChange: (value: string) => void
  onSearchEndDateChange: (value: string) => void
  onClearSearchFilters: () => void
  onSearch: () => void
}

export const PromoSection = ({
  selectedBankName,
  selectedCategoryName,
  isLoading,
  promoTotal,
  promoPage,
  promoTotalPages,
  canLoadMorePromos,
  onLoadMorePromos,
  onOpenPromoDetail,
  promos,
  savedPromoIds,
  savedOfferCount,
  isSavedView,
  onToggleSavedView,
  onToggleSavedPromo,
  searchText,
  searchStartDate,
  searchEndDate,
  isSearchMode,
  searchDisabled,
  onSearchTextChange,
  onSearchStartDateChange,
  onSearchEndDateChange,
  onClearSearchFilters,
  onSearch,
}: PromoSectionProps) => {
  const canClearFilters =
    isSearchMode || Boolean(searchText.trim()) || Boolean(searchStartDate) || Boolean(searchEndDate)
  const visibleTotal = isSavedView ? savedOfferCount : promoTotal
  const headingText = isSavedView ? 'Saved Offers' : `${selectedBankName} ${selectedCategoryName} Promotions`
  const resultsSummary = isSavedView
    ? 'Review the offers you saved for later.'
    : `Showing page ${promoPage} of ${promoTotalPages} ${
        isSearchMode ? 'from search results.' : 'for selected category offers.'
      }`

  return (
    <section className={styles.panel}>
      <div className={styles.promoActionsRow}>
        {!searchDisabled && (
          <SearchFilters
            searchText={searchText}
            searchStartDate={searchStartDate}
            searchEndDate={searchEndDate}
            isSavedView={isSavedView}
            onSearchTextChange={onSearchTextChange}
            onSearchStartDateChange={onSearchStartDateChange}
            onSearchEndDateChange={onSearchEndDateChange}
            onClearSearchFilters={onClearSearchFilters}
            onSearch={onSearch}
            canClearFilters={canClearFilters}
          />
        )}

        <button
          type="button"
          className={`${styles.savedViewToggle} ${isSavedView ? styles.active : ''}`}
          onClick={onToggleSavedView}
          aria-pressed={isSavedView}
        >
          ♥ Saved offers ({savedOfferCount})
        </button>
      </div>

      <div className={styles.panelTitleRow}>
        <div className={styles.resultsHeading}>
          <h2>{headingText}</h2>
          {isLoading && !isSavedView && (
            <span className={styles.loadingIndicator} aria-live="polite" aria-busy="true">
              <span className={styles.loadingSpinner} aria-hidden="true" />
              Loading...
            </span>
          )}
        </div>
        <span>{visibleTotal} total items</span>
      </div>

      <p className="subtitle">{resultsSummary}</p>

      {promos.length > 0 ? (
        <div className={styles.promoGrid}>
          {promos.map((promo) => (
            <PromoCard
              key={promo.id}
              promo={promo}
              savedPromoIds={savedPromoIds}
              isSavedView={isSavedView}
              onToggleSavedPromo={onToggleSavedPromo}
              onOpenPromoDetail={onOpenPromoDetail}
            />
          ))}
        </div>
      ) : null}

      {canLoadMorePromos && !isSavedView && (
        <button type="button" className={styles.loadMoreBtn} onClick={onLoadMorePromos}>
          Load more promotions
        </button>
      )}
    </section>
  )
}
