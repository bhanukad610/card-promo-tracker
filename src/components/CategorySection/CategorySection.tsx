import type { Bank, BankId, Category } from '../../types/promo'
import { formatCategoryName } from '../../utils/formatters'
import styles from './CategorySection.module.css'

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
  <section className={styles.panel}>
    <div className={styles.panelTitleRow}>
      <h2>Banks</h2>
    </div>

    <label className={styles.bankSelectLabel} htmlFor="bank-select">
      Select bank
    </label>
    <select
      id="bank-select"
      className={styles.bankSelect}
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
        <div className={`${styles.panelTitleRow} ${styles.panelSubtitleRow}`}>
          <h2>Card Type</h2>
        </div>
        <div className={styles.cardTypeFilter}>
          {(['All', 'Credit', 'Debit'] as const).map((cardType) => (
            <button
              key={cardType}
              type="button"
              className={`${styles.cardTypeChip} ${selectedCardType === cardType ? styles.active : ''}`}
              onClick={() => onSelectCardType(cardType)}
            >
              {cardType}
            </button>
          ))}
        </div>
      </>
    )}

    <div className={`${styles.panelTitleRow} ${styles.panelSubtitleRow}`}>
      <h2>Promotion Categories</h2>
    </div>
    <label className={styles.categorySelectLabel} htmlFor="category-select">
      Select promotion category
    </label>
    <select
      id="category-select"
      className={styles.categorySelect}
      value={selectedCategoryId ?? ''}
      onChange={(event) => onSelectCategory(event.target.value)}
    >
      {categories.map((item) => (
        <option key={item.id} value={item.id}>
          {formatCategoryName(item.category)}
        </option>
      ))}
    </select>

    <div className={styles.categoryGrid}>
      {categories.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`${styles.categoryCard} ${selectedCategoryId === item.id ? styles.active : ''}`}
          onClick={() => onSelectCategory(item.id)}
        >
          <p className={styles.categoryName}>{formatCategoryName(item.category)}</p>
        </button>
      ))}
    </div>
  </section>
)
