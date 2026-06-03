import type { Bank, BankId, Category } from '../types/promo'
import { formatCategoryName } from '../utils/formatters'

type CategorySectionProps = {
  banks: Bank[]
  selectedBankId: BankId
  onSelectBank: (bankId: BankId) => void
  categories: Category[]
  selectedCategoryId: string | null
  onSelectCategory: (id: string) => void
  selectedCardType: 'All' | 'Credit' | 'Debit'
  onSelectCardType: (cardType: 'All' | 'Credit' | 'Debit') => void
}

export const CategorySection = ({
  banks,
  selectedBankId,
  onSelectBank,
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedCardType,
  onSelectCardType,
}: CategorySectionProps) => (
  <section className="panel">
    <div className="panel-title-row">
      <h2>Banks</h2>
    </div>
    <label className="bank-select-label" htmlFor="bank-select">
      Select bank
    </label>
    <select
      id="bank-select"
      className="bank-select"
      value={selectedBankId}
      onChange={(event) => onSelectBank(event.target.value as BankId)}
    >
      {banks.map((bank) => (
        <option key={bank.id} value={bank.id}>
          {bank.name}
        </option>
      ))}
    </select>
    {selectedBankId === 'hnb' && (
      <>
        <div className="panel-title-row panel-subtitle-row">
          <h2>Card Type</h2>
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
      </>
    )}
    <div className="panel-title-row panel-subtitle-row">
      <h2>Promotion Categories</h2>
    </div>
    <label className="category-select-label" htmlFor="category-select">
      Select promotion category
    </label>
    <select
      id="category-select"
      className="category-select"
      value={selectedCategoryId ?? ''}
      onChange={(event) => onSelectCategory(event.target.value)}
    >
      {categories.map((item) => (
        <option key={item.id} value={item.id}>
          {formatCategoryName(item.category)}
        </option>
      ))}
    </select>
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
