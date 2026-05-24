import type { Category } from '../types/promo'
import { formatCategoryName } from '../utils/formatters'

type CategorySectionProps = {
  categories: Category[]
  selectedCategoryId: number | null
  onSelectCategory: (id: number) => void
}

export const CategorySection = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySectionProps) => (
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
          onClick={() => onSelectCategory(item.id)}
        >
          <p className="category-name">{formatCategoryName(item.category)}</p>
        </button>
      ))}
    </div>
  </section>
)
