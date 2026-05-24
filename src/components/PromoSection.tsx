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
  searchText: string
  searchStartDate: string
  searchEndDate: string
  isSearchMode: boolean
  onSearchTextChange: (value: string) => void
  onSearchStartDateChange: (value: string) => void
  onSearchEndDateChange: (value: string) => void
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
  searchText,
  searchStartDate,
  searchEndDate,
  isSearchMode,
  onSearchTextChange,
  onSearchStartDateChange,
  onSearchEndDateChange,
  onSearch,
}: PromoSectionProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <section className="panel">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="search"
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          placeholder="Search promotions by location, merchant, or keyword"
          className="search-input"
        />
        <input
          type="date"
          value={searchStartDate}
          onChange={(event) => onSearchStartDateChange(event.target.value)}
          className="search-input"
          aria-label="Search start date"
        />
        <input
          type="date"
          value={searchEndDate}
          onChange={(event) => onSearchEndDateChange(event.target.value)}
          className="search-input"
          aria-label="Search end date"
        />
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
      <div className="panel-title-row">
        <div className="results-heading">
          <h2>{selectedCategoryName} Promotions</h2>
          {isLoading && (
            <span className="loading-indicator" aria-live="polite" aria-busy="true">
              <span className="loading-spinner" aria-hidden="true" />
              Loading...
            </span>
          )}
        </div>
        <span>{promoTotal} total items</span>
      </div>
      <p className="subtitle">
        Showing page {promoPage} of {promoTotalPages}{' '}
        {isSearchMode ? 'from search results.' : 'for selected category offers.'}
      </p>
      <div className="promo-grid">
        {promos.map((promo) => (
          <article key={promo.id} className="promo-card">
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
        ))}
      </div>
      {canLoadMorePromos && (
        <button type="button" className="load-more-btn" onClick={onLoadMorePromos} disabled={isLoading}>
          {isLoading ? 'Loading more...' : 'Load more'}
        </button>
      )}
    </section>
  )
}
