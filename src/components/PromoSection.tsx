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
  promos: Promo[]
}

export const PromoSection = ({
  selectedCategoryName,
  isLoading,
  promoTotal,
  promoPage,
  promoTotalPages,
  canLoadMorePromos,
  onLoadMorePromos,
  promos,
}: PromoSectionProps) => (
  <section className="panel">
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
      Showing page {promoPage} of {promoTotalPages} for Credit card offers.
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
