import type { Category } from '../types/promo'
import { formatCategoryName } from '../utils/formatters'

type CardTypeFilter = 'all' | 'credit' | 'debit'

type CategorySectionProps = {
  categories: Category[]
  selectedCategoryId: number | null
  onSelectCategory: (id: number) => void
  selectedCardType: CardTypeFilter
  onSelectCardType: (type: CardTypeFilter) => void
}

const cardTypeOptions: Array<{ label: string; value: CardTypeFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Credit', value: 'credit' },
  { label: 'Debit', value: 'debit' },
]

export const CategorySection = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedCardType,
  onSelectCardType,
}: CategorySectionProps) => (
  <aside className="sidebar-panel">
    <div className="filter-block">
      <h2>Sort by Card Type</h2>
      <div className="card-type-options" role="radiogroup" aria-label="Sort by card type">
        {cardTypeOptions.map((option) => (
          <label key={option.value} className="card-type-option">
            <input
              type="radio"
              name="cardType"
              value={option.value}
              checked={selectedCardType === option.value}
              onChange={() => onSelectCardType(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="filter-block">
      <h2>Sort by Category</h2>
      <div className="category-list">
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
    </div>
  </aside>
)
