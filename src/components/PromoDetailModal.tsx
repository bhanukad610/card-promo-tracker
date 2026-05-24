import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchPromoDetail } from '../api/promos'
import type { PromoDetail } from '../types/promo'

type PromoDetailModalProps = {
  promoId: number
  onClose: () => void
}

export const PromoDetailModal = ({ promoId, onClose }: PromoDetailModalProps) => {
  const [detail, setDetail] = useState<PromoDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadPromoDetail = async () => {
      setDetailLoading(true)
      setDetailError(null)

      try {
        const promoDetail = await fetchPromoDetail(promoId, controller.signal)
        setDetail(promoDetail)
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
          setDetailError('Failed to load promotion details. Please try again.')
        }
      } finally {
        setDetailLoading(false)
      }
    }

    loadPromoDetail()

    return () => controller.abort()
  }, [promoId])

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
    <div className="promo-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="promo-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="promo-modal-close" aria-label="Close promotion details" onClick={onClose}>
          ×
        </button>
        {detailLoading && <p>Loading promotion details...</p>}
        {detailError && <p className="status error">{detailError}</p>}
        {!detailLoading && !detailError && detail && (
          <>
            <h3 id="promo-modal-title">{detail.title}</h3>
            <p className="promo-merchant">{detail.merchant}</p>
            <p className="subtitle">{detail.valid || `Valid From ${detail.from} to ${detail.to}`}</p>
            <div className="promo-detail-content" dangerouslySetInnerHTML={{ __html: detail.content }} />
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
