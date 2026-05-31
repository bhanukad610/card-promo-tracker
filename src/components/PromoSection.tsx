import type { FormEvent } from 'react'
import { FILE_BASE } from '../constants/api'
import type { Promo } from '../types/promo'

type PromoSectionProps = {
  selectedCategoryName: string
  isLoading: boolean
  promoTotal: number
  promoPage: number
  promoTotalPages: number
  canLoadMorePromos: boolean
  onLoadMorePromos: () => void
  onOpenPromoDetail: (promoId: number) => void
  promos: Promo[]
  savedPromoIds: Set<number>
  savedOfferCount: number
  isSavedView: boolean
  onToggleSavedView: () => void
  onToggleSavedPromo: (promo: Promo) => void
  searchText: string
  searchStartDate: string
  searchEndDate: string
  isSearchMode: boolean
  onSearchTextChange: (value: string) => void
  onSearchStartDateChange: (value: string) => void
  onSearchEndDateChange: (value: string) => void
  onClearSearchFilters: () => void
  onSearch: () => void
}

export const PromoSection = ({
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
  onSearchTextChange,
  onSearchStartDateChange,
  onSearchEndDateChange,
  onClearSearchFilters,
  onSearch,
}: PromoSectionProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch()
  }

  const canClearFilters = isSearchMode || Boolean(searchText.trim()) || Boolean(searchStartDate) || Boolean(searchEndDate)
  const visibleTotal = isSavedView ? savedOfferCount : promoTotal
  const headingText = isSavedView ? 'Saved Offers' : `${selectedCategoryName} Promotions`
  const resultsSummary = isSavedView
    ? 'Review the offers you saved for later.'
    : `Showing page ${promoPage} of ${promoTotalPages} ${
        isSearchMode ? 'from search results.' : 'for selected category offers.'
      }`

  return (
    <section className="panel">
      <div className="promo-actions-row">
        <form className="search-form" onSubmit={handleSubmit} aria-label="Search promotions">
          <input
            type="search"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Search promotions by location, merchant, or keyword"
            className="search-input"
            disabled={isSavedView}
          />
          <input
            type="date"
            value={searchStartDate}
            onChange={(event) => onSearchStartDateChange(event.target.value)}
            className="search-input"
            aria-label="Search start date"
            disabled={isSavedView}
          />
          <input
            type="date"
            value={searchEndDate}
            onChange={(event) => onSearchEndDateChange(event.target.value)}
            className="search-input"
            aria-label="Search end date"
            disabled={isSavedView}
          />
          <button type="submit" className="search-btn" disabled={isSavedView}>
            Search
          </button>
          <button
            type="button"
            className="search-btn search-btn-secondary"
            onClick={onClearSearchFilters}
            disabled={isSavedView || !canClearFilters}
          >
            Clear filters
          </button>
        </form>
        <button
          type="button"
          className={`saved-view-toggle${isSavedView ? ' active' : ''}`}
          onClick={onToggleSavedView}
          aria-pressed={isSavedView}
        >
          ♥ Saved offers ({savedOfferCount})
        </button>
      </div>
      <div className="panel-title-row">
        <div className="results-heading">
          <h2>{headingText}</h2>
          {isLoading && !isSavedView && (
            <span className="loading-indicator" aria-live="polite" aria-busy="true">
              <span className="loading-spinner" aria-hidden="true" />
              Loading...
            </span>
          )}
        </div>
        <span>{visibleTotal} total items</span>
      </div>
      <p className="subtitle">{resultsSummary}</p>
      {promos.length > 0 ? (
        <div className="promo-grid">
          {promos.map((promo) => {
            const isSaved = savedPromoIds.has(promo.id)

            return (
              <article key={promo.id} className="promo-card">
                <button
                  type="button"
                  className={`save-offer-btn${isSaved ? ' saved' : ''}`}
                  onClick={() => onToggleSavedPromo(promo)}
                  aria-pressed={isSaved}
                  aria-label={isSaved ? `Unsave ${promo.title}` : `Save ${promo.title}`}
                >
                  <svg
                    aria-hidden="true"
                    className="save-offer-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.8 4.6c-1.6-1.6-4.1-1.6-5.7 0L12 7.7 8.9 4.6C7.3 3 4.8 3 3.2 4.6s-1.6 4.1 0 5.7L12 19.1l8.8-8.8c1.6-1.6 1.6-4.1 0-5.7Z" />
                  </svg>
                </button>
                <img
                  src={`${FILE_BASE}${promo.thumb}`}
                  alt={`${promo.merchant} logo`}
                  className="promo-thumb"
                  loading="lazy"
                />
                <div className="promo-body">
                  <p className="promo-merchant">{promo.merchant}</p>
                  <h3>{promo.title}</h3>
                  <div className="promo-meta">
                    <span className="badge">{promo.cardType.toUpperCase()}</span>
                    <span>Valid till {promo.to}</span>
                  </div>
                </div>
                <button type="button" className="view-more-btn" onClick={() => onOpenPromoDetail(promo.id)}>
                  View more
                </button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>{isSavedView ? 'No saved offers yet.' : 'No promotions found.'}</p>
          {isSavedView && <span>Tap “♡ Save” on any offer to keep it here for later.</span>}
        </div>
      )}
      {!isSavedView && canLoadMorePromos && (
        <button type="button" className="load-more-btn" onClick={onLoadMorePromos} disabled={isLoading}>
          {isLoading ? 'Loading more...' : 'Load more'}
        </button>
      )}
    </section>
  )
}
