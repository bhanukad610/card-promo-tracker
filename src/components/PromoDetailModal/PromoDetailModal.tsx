import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchPromoDetail } from '../../services/promos.service'
import styles from './PromoDetailModal.module.css'
import type { BankId, Promo, PromoDetail } from '../../types/promo'

type PromoDetailModalProps = {
  promoId: string
  promo?: Promo
  isSaved: boolean
  onToggleSaved?: () => void
  onClose: () => void
}

const promoDetailCache = new Map<string, PromoDetail>()
const pendingPromoDetailRequests = new Map<string, Promise<PromoDetail>>()

const getPromoDetailCacheKey = (bankId: BankId, promoId: string) => `${bankId}:${promoId}`

const loadCachedPromoDetail = (bankId: BankId, promoId: string) => {
  const cacheKey = getPromoDetailCacheKey(bankId, promoId)
  const cachedDetail = promoDetailCache.get(cacheKey)

  if (cachedDetail) {
    return Promise.resolve(cachedDetail)
  }

  const pendingRequest = pendingPromoDetailRequests.get(cacheKey)

  if (pendingRequest) {
    return pendingRequest
  }

  const nextRequest = fetchPromoDetail(bankId, promoId)
    .then((promoDetail) => {
      promoDetailCache.set(cacheKey, promoDetail)
      return promoDetail
    })
    .finally(() => {
      pendingPromoDetailRequests.delete(cacheKey)
    })

  pendingPromoDetailRequests.set(cacheKey, nextRequest)
  return nextRequest
}

export const PromoDetailModal = ({ promoId, promo, isSaved, onToggleSaved, onClose }: PromoDetailModalProps) => {
  const [detail, setDetail] = useState<PromoDetail | null>(promo?.detail ?? null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const bankId = promo?.bankId ?? 'hnb'

  useEffect(() => {
    let isActive = true

    const loadPromoDetail = async () => {
      setDetailLoading(true)
      setDetailError(null)

      try {
        if (promo?.detail) {
          setDetail(promo.detail)
          return
        }

        const promoDetail = await loadCachedPromoDetail(bankId, promoId)

        if (isActive) {
          setDetail(promoDetail)
        }
      } catch {
        if (isActive) {
          setDetailError('Failed to load promotion details. Please try again.')
        }
      } finally {
        if (isActive) {
          setDetailLoading(false)
        }
      }
    }

    loadPromoDetail()

    return () => {
      isActive = false
    }
  }, [bankId, promoId, promo?.detail])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className={styles.promoModalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.promoModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.promoModalClose} aria-label="Close promotion details" onClick={onClose}>
          ×
        </button>
        {detailLoading && <p>Loading promotion details...</p>}
        {detailError && <p className={`${styles.status} ${styles.error}`}>{detailError}</p>}
        {!detailLoading && !detailError && detail && (
          <>
            <div className={styles.promoModalHeader}>
              <div>
                <h3 id="promo-modal-title">{detail.title}</h3>
                <p className={styles.promoMerchant}>{detail.merchant}</p>
              </div>
              {promo && onToggleSaved && (
                <button
                  type="button"
                  className={`${styles.modalSaveBtn} ${isSaved ? styles.saved : ''}`}
                  onClick={onToggleSaved}
                  aria-pressed={isSaved}
                >
                  {isSaved ? '♥ Saved' : '♡ Save for later'}
                </button>
              )}
            </div>
            <p className={styles.subtitle}>{detail.valid || `Valid From ${detail.from} to ${detail.to}`}</p>
            <div className={styles.promoDetailContent} dangerouslySetInnerHTML={{ __html: detail.content }} />
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
