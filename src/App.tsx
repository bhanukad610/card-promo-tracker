import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Category = {
  id: number
  category: string
  order: number
}

type CategoryResponse = {
  status: number
  data: Category[]
}

type Promo = {
  id: number
  title: string
  thumb: string
  merchant: string
  cardType: string
  to: string
  valid: string
}

type PromoResponse = {
  page: number
  totalPages: number
  total: number
  data: Promo[]
}

const API_BASE = 'https://venus.hnb.lk/api'
const FILE_BASE = 'https://venus.hnb.lk/'

function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [promos, setPromos] = useState<Promo[]>([])
  const [promoPage, setPromoPage] = useState(1)
  const [promoTotal, setPromoTotal] = useState(0)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingPromos, setLoadingPromos] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadCategories = async () => {
      setLoadingCategories(true)
      setError(null)

      try {
        const categoryRes = await fetch(`${API_BASE}/get_all_card_promotion_categories`, {
          method: 'GET',
          signal: controller.signal,
        })

        if (!categoryRes.ok) {
          throw new Error('Unable to fetch categories at the moment.')
        }

        const categoryJson: CategoryResponse = await categoryRes.json()
        const sortedCategories = [...categoryJson.data].sort((a, b) =>
          a.order === b.order ? a.category.localeCompare(b.category) : a.order - b.order,
        )

        setCategories(sortedCategories)
        setSelectedCategoryId((prev) => prev ?? sortedCategories[0]?.id ?? null)
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
          setError('Failed to load categories. Please refresh and try again.')
        }
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (selectedCategoryId === null) {
      return
    }

    const controller = new AbortController()

    const loadPromosForCategory = async () => {
      setLoadingPromos(true)
      setError(null)

      try {
        const promoRes = await fetch(
          `${API_BASE}/get_all_web_card_promos?cat=${selectedCategoryId}&page=1&cardType=Credit`,
          {
            method: 'GET',
            signal: controller.signal,
          },
        )

        if (!promoRes.ok) {
          throw new Error('Unable to fetch promotions at the moment.')
        }

        const promoJson: PromoResponse = await promoRes.json()
        setPromos(promoJson.data)
        setPromoPage(promoJson.page)
        setPromoTotal(promoJson.total)
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
          setError('Failed to load promotions. Please try another category.')
        }
      } finally {
        setLoadingPromos(false)
      }
    }

    loadPromosForCategory()

    return () => controller.abort()
  }, [selectedCategoryId])

  const categoryCountByOrder = useMemo(() => {
    return categories.reduce<Record<number, number>>((acc, item) => {
      acc[item.order] = (acc[item.order] || 0) + 1
      return acc
    }, {})
  }, [categories])

  const selectedCategoryName =
    categories.find((category) => category.id === selectedCategoryId)?.category ?? 'Selected Category'

  const isLoading = loadingCategories || (selectedCategoryId !== null && loadingPromos)

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">HNB Card Promotions</p>
        <h1>Credit Card Promotions Layout</h1>
        <p className="subtitle">
          Click a category to load offers from <code>get_all_web_card_promos</code> using that
          category id.
        </p>
      </header>

      {isLoading && <p className="status">Loading categories and promotions…</p>}
      {error && <p className="status error">{error}</p>}

      {!loadingCategories && !error && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>Promotion Categories</h2>
              <span>{categories.length} categories</span>
            </div>
            <div className="category-grid">
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`category-card ${selectedCategoryId === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryId(item.id)}
                >
                  <p className="category-name">{item.category}</p>
                  <div className="category-meta">
                    <span>Order {item.order}</span>
                    <span>{categoryCountByOrder[item.order]} in this order</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {!error && (
            <section className="panel">
              <div className="panel-title-row">
                <h2>{selectedCategoryName} Promotions</h2>
                <span>{promoTotal} total items</span>
              </div>
              <p className="subtitle">Showing page {promoPage} for Credit card offers.</p>
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
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App
