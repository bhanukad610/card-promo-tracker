import type { FormEvent } from 'react'
import styles from './SearchFilters.module.css'

type SearchFiltersProps = {
  searchText: string
  searchStartDate: string
  searchEndDate: string
  isSavedView: boolean
  canClearFilters: boolean
  onSearchTextChange: (value: string) => void
  onSearchStartDateChange: (value: string) => void
  onSearchEndDateChange: (value: string) => void
  onClearSearchFilters: () => void
  onSearch: () => void
}

export const SearchFilters = ({
  searchText,
  searchStartDate,
  searchEndDate,
  isSavedView,
  canClearFilters,
  onSearchTextChange,
  onSearchStartDateChange,
  onSearchEndDateChange,
  onClearSearchFilters,
  onSearch,
}: SearchFiltersProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit} aria-label="Search promotions">
      <input
        type="search"
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        placeholder="Search promotions by location, merchant, or keyword"
        className={styles.searchInput}
        disabled={isSavedView}
      />
      <input
        type="date"
        value={searchStartDate}
        onChange={(event) => onSearchStartDateChange(event.target.value)}
        className={styles.searchInput}
        aria-label="Search start date"
        disabled={isSavedView}
      />
      <input
        type="date"
        value={searchEndDate}
        onChange={(event) => onSearchEndDateChange(event.target.value)}
        className={styles.searchInput}
        aria-label="Search end date"
        disabled={isSavedView}
      />
      <button type="submit" className={styles.searchBtn} disabled={isSavedView}>
        Search
      </button>
      <button
        type="button"
        className={`${styles.searchBtn} ${styles.searchBtnSecondary}`}
        onClick={onClearSearchFilters}
        disabled={isSavedView || !canClearFilters}
      >
        Clear filters
      </button>
    </form>
  )
}
