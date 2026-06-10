import { BANKS } from '../../constants/banks'
import type { Promo } from '../../types/promo'
import { isPromoExpired } from '../../utils/promoStatus'
import styles from './PromoCard.module.css'

type PromoCardProps = {
  promo: Promo
  savedPromoIds: Set<string>
  isSavedView: boolean
  onToggleSavedPromo: (promo: Promo) => void
  onOpenPromoDetail: (promoId: string) => void
}

const getPromoBank = (promo: Promo) => BANKS.find((item) => item.id === promo.bankId)

const getPromoImageUrl = (promo: Promo) => {
  if (/^https?:\/\//i.test(promo.thumb)) {
    return promo.thumb
  }

  const bank = getPromoBank(promo)
  return `${bank?.fileBase ?? ''}${promo.thumb}`
}

export const PromoCard = ({
  promo,
  savedPromoIds,
  isSavedView,
  onToggleSavedPromo,
  onOpenPromoDetail,
}: PromoCardProps) => {
  const isSaved = savedPromoIds.has(promo.id)
  const promoBank = getPromoBank(promo)
  const isExpiredSavedPromo = isSavedView && isPromoExpired(promo.to)
  const canViewPromoDetail = promo.bankId !== 'hnb'

  return (
    <article className={`${styles.promoCard} ${isExpiredSavedPromo ? styles.expired : ''}`}>
      <button
        type="button"
        className={`${styles.saveOfferBtn} ${isSaved ? styles.saved : ''}`}
        onClick={() => onToggleSavedPromo(promo)}
        aria-pressed={isSaved}
        aria-label={isSaved ? `Unsave ${promo.title}` : `Save ${promo.title}`}
      >
        <svg
          aria-hidden="true"
          className={styles.saveOfferIcon}
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

      <img src={getPromoImageUrl(promo)} alt={`${promo.merchant} logo`} className={styles.promoThumb} loading="lazy" />

      <div className={styles.promoBody}>
        <p className={styles.promoMerchant}>{promo.merchant}</p>
        <h3>{promo.title}</h3>
        <div className={styles.promoMeta}>
          {isSavedView && promoBank && <span className={`${styles.badge} ${styles.bankBadge}`}>{promoBank.shortName}</span>}
          <span className={styles.badge}>{promo.cardType.toUpperCase()}</span>
          {isExpiredSavedPromo && <span className={`${styles.badge} ${styles.expiredBadge}`}>Expired</span>}
          <span>Valid till {promo.to}</span>
        </div>
      </div>

      <button
        type="button"
        className={styles.viewMoreBtn}
        onClick={() => onOpenPromoDetail(promo.id)}
        disabled={!canViewPromoDetail}
      >
        View more
      </button>
    </article>
  )
}
