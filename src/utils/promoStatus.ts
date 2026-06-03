const MONTH_INDEX_BY_NAME: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

const getEndOfDate = (year: number, monthIndex: number, day: number) => {
  const date = new Date(year, monthIndex, day, 23, 59, 59, 999)

  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) {
    return null
  }

  return date
}

export const parsePromoExpiryDate = (value?: string | null) => {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    return null
  }

  const isoDateMatch = normalizedValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)

  if (isoDateMatch) {
    return getEndOfDate(Number(isoDateMatch[1]), Number(isoDateMatch[2]) - 1, Number(isoDateMatch[3]))
  }

  const dayMonthYearMatch = normalizedValue.match(/(\d{1,2})(?:st|nd|rd|th)?[\s./-]+([A-Za-z]+)[\s,./-]+(\d{4})/i)

  if (dayMonthYearMatch) {
    const monthIndex = MONTH_INDEX_BY_NAME[dayMonthYearMatch[2].toLowerCase()]

    if (monthIndex !== undefined) {
      return getEndOfDate(Number(dayMonthYearMatch[3]), monthIndex, Number(dayMonthYearMatch[1]))
    }
  }

  const numericDateMatch = normalizedValue.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)

  if (numericDateMatch) {
    return getEndOfDate(Number(numericDateMatch[3]), Number(numericDateMatch[2]) - 1, Number(numericDateMatch[1]))
  }

  return null
}

export const isPromoExpired = (expiryValue?: string | null, referenceDate = new Date()) => {
  const expiryDate = parsePromoExpiryDate(expiryValue)

  if (!expiryDate) {
    return false
  }

  return expiryDate.getTime() < referenceDate.getTime()
}
