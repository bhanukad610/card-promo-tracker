const CATEGORY_ACRONYMS = new Set(['amex', 'bnpl', 'emi', 'hnb', 'lkr', 'sms', 'usd', 'visa'])

export const formatCategoryName = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((part) => {
      const normalized = part.toLowerCase()

      if (CATEGORY_ACRONYMS.has(normalized)) {
        return normalized.toUpperCase()
      }

      return normalized.charAt(0).toUpperCase() + normalized.slice(1)
    })
    .join(' ')
