import { describe, it, expect } from 'vitest'
import { parsePromoExpiryDate, isPromoExpired } from './promoStatus'

describe('parsePromoExpiryDate', () => {
  describe('ISO format (YYYY-MM-DD)', () => {
    it('parses a valid ISO date', () => {
      const result = parsePromoExpiryDate('2024-12-31')
      expect(result).not.toBeNull()
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(11) // December
      expect(result?.getDate()).toBe(31)
    })

    it('returns a date at end-of-day (23:59:59.999)', () => {
      const result = parsePromoExpiryDate('2024-06-15')
      expect(result?.getHours()).toBe(23)
      expect(result?.getMinutes()).toBe(59)
      expect(result?.getSeconds()).toBe(59)
      expect(result?.getMilliseconds()).toBe(999)
    })

    it('returns null for an invalid day (32)', () => {
      expect(parsePromoExpiryDate('2024-01-32')).toBeNull()
    })

    it('returns null for an invalid month (13)', () => {
      expect(parsePromoExpiryDate('2024-13-01')).toBeNull()
    })
  })

  describe('English format (DD Mon YYYY / DD Month YYYY)', () => {
    it('parses "31st Dec 2024"', () => {
      const result = parsePromoExpiryDate('31st Dec 2024')
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(11)
      expect(result?.getDate()).toBe(31)
    })

    it('parses "31 December 2024"', () => {
      const result = parsePromoExpiryDate('31 December 2024')
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(11)
      expect(result?.getDate()).toBe(31)
    })

    it('parses "1st January 2025"', () => {
      const result = parsePromoExpiryDate('1st January 2025')
      expect(result?.getFullYear()).toBe(2025)
      expect(result?.getMonth()).toBe(0)
      expect(result?.getDate()).toBe(1)
    })

    it('parses ordinal suffixes nd, rd, th', () => {
      expect(parsePromoExpiryDate('2nd Feb 2024')?.getDate()).toBe(2)
      expect(parsePromoExpiryDate('3rd Mar 2024')?.getDate()).toBe(3)
      expect(parsePromoExpiryDate('4th Apr 2024')?.getDate()).toBe(4)
    })

    it('returns null for an unknown month name', () => {
      expect(parsePromoExpiryDate('15 Abc 2024')).toBeNull()
    })
  })

  describe('Numeric format (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY)', () => {
    it('parses DD/MM/YYYY', () => {
      const result = parsePromoExpiryDate('31/12/2024')
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(11)
      expect(result?.getDate()).toBe(31)
    })

    it('parses DD-MM-YYYY', () => {
      const result = parsePromoExpiryDate('31-12-2024')
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(11)
      expect(result?.getDate()).toBe(31)
    })

    it('parses DD.MM.YYYY', () => {
      const result = parsePromoExpiryDate('31.12.2024')
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(11)
      expect(result?.getDate()).toBe(31)
    })

    it('returns null for an invalid day (32)', () => {
      expect(parsePromoExpiryDate('32/01/2024')).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('returns null for null', () => {
      expect(parsePromoExpiryDate(null)).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(parsePromoExpiryDate(undefined)).toBeNull()
    })

    it('returns null for an empty string', () => {
      expect(parsePromoExpiryDate('')).toBeNull()
    })

    it('returns null for a whitespace-only string', () => {
      expect(parsePromoExpiryDate('   ')).toBeNull()
    })

    it('returns null for a non-date string', () => {
      expect(parsePromoExpiryDate('Valid till further notice')).toBeNull()
    })
  })
})

describe('isPromoExpired', () => {
  const REFERENCE_DATE = new Date('2025-06-01T12:00:00.000Z')

  it('returns true for a past expiry date', () => {
    expect(isPromoExpired('2020-01-01', REFERENCE_DATE)).toBe(true)
  })

  it('returns false for a future expiry date', () => {
    expect(isPromoExpired('2099-12-31', REFERENCE_DATE)).toBe(false)
  })

  it('returns false for an unparseable value', () => {
    expect(isPromoExpired('not a date', REFERENCE_DATE)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isPromoExpired(null, REFERENCE_DATE)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isPromoExpired(undefined, REFERENCE_DATE)).toBe(false)
  })

  it('uses the current date as the default reference', () => {
    // A date far in the future should never be expired
    expect(isPromoExpired('2099-12-31')).toBe(false)
    // A date far in the past should always be expired
    expect(isPromoExpired('2000-01-01')).toBe(true)
  })
})
