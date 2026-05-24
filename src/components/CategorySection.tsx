import type { Category } from '../types/promo'
import { formatCategoryName } from '../utils/formatters'

type CategorySectionProps = {
  categories: Category[]
  selectedCategoryId: number | null
  onSelectCategory: (id: number) => void
  selectedCardType: 'All' | 'Credit' | 'Debit'
  onSelectCardType: (cardType: 'All' | 'Credit' | 'Debit') => void
}

export const CategorySection = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedCardType,
  onSelectCardType,
}: CategorySectionProps) => (
  <section className="panel">
    <div className="panel-title-row">
      <h2>Promotion Categories</h2>
    </div>
    <div className="card-type-filter">
      {(['All', 'Credit', 'Debit'] as const).map((cardType) => (
        <button
          key={cardType}
          type="button"
          className={`card-type-chip ${selectedCardType === cardType ? 'active' : ''}`}
          onClick={() => onSelectCardType(cardType)}
        >
          {cardType}
        </button>
      ))}
    </div>
    <div className="category-grid">
      {categories.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`category-card ${selectedCategoryId === item.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(item.id)}
        >
          <p className="category-name">{formatCategoryName(item.category)}</p>
        </button>
      ))}
    </div>
  </section>
)
