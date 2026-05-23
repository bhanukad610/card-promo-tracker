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
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [categoryRes, promoRes] = await Promise.all([
          fetch(`${API_BASE}/get_all_card_promotion_categories`, {
            method: 'GET',
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/get_all_web_card_promos?page=1&cardType=Credit`, {
            method: 'GET',
            signal: controller.signal,
          }),
        ])

        if (!categoryRes.ok || !promoRes.ok) {
          throw new Error('Unable to fetch promotions at the moment.')
        }

        const categoryJson: CategoryResponse = await categoryRes.json()
        const promoJson: PromoResponse = await promoRes.json()

        setCategories(
          [...categoryJson.data].sort((a, b) =>
            a.order === b.order ? a.category.localeCompare(b.category) : a.order - b.order,
          ),
        )
        setPromos(promoJson.data)
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
          setError('Failed to load data. Please refresh and try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()

    return () => controller.abort()
  }, [])

  const categoryCountByOrder = useMemo(() => {
    return categories.reduce<Record<number, number>>((acc, item) => {
      acc[item.order] = (acc[item.order] || 0) + 1
      return acc
    }, {})
  }, [categories])

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">HNB Card Promotions</p>
        <h1>Credit Card Promotions Layout</h1>
        <p className="subtitle">
          Categories from <code>get_all_card_promotion_categories</code> and promotion cards from{' '}
          <code>get_all_web_card_promos</code>.
        </p>
      </header>

      {loading && <p className="status">Loading categories and promotions…</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="panel">
            <div className="panel-title-row">
              <h2>Promotion Categories</h2>
              <span>{categories.length} categories</span>
            </div>
            <div className="category-grid">
              {categories.map((item) => (
                <article key={item.id} className="category-card">
                  <p className="category-name">{item.category}</p>
                  <div className="category-meta">
                    <span>Order {item.order}</span>
                    <span>{categoryCountByOrder[item.order]} in this order</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>Latest Credit Promotions</h2>
              <span>{promos.length} items on page 1</span>
            </div>
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
        </>
      )}
    </main>
  )
}

export default App
