import { describe, it, expect } from 'vitest'
import { formatCategoryName } from './formatters'

describe('formatCategoryName', () => {
  it('title-cases a plain lowercase word', () => {
    expect(formatCategoryName('shopping')).toBe('Shopping')
  })

  it('replaces underscores with spaces', () => {
    expect(formatCategoryName('online_shopping')).toBe('Online Shopping')
  })

  it('replaces hyphens with spaces', () => {
    expect(formatCategoryName('online-shopping')).toBe('Online Shopping')
  })

  it('collapses multiple separators into one space', () => {
    expect(formatCategoryName('online__shopping')).toBe('Online Shopping')
    expect(formatCategoryName('online--shopping')).toBe('Online Shopping')
    expect(formatCategoryName('online_-shopping')).toBe('Online Shopping')
  })

  it('trims leading and trailing whitespace', () => {
    expect(formatCategoryName('  shopping  ')).toBe('Shopping')
  })

  it('uppercases known acronyms', () => {
    const acronyms: [string, string][] = [
      ['amex', 'AMEX'],
      ['bnpl', 'BNPL'],
      ['emi', 'EMI'],
      ['hnb', 'HNB'],
      ['lkr', 'LKR'],
      ['sms', 'SMS'],
      ['usd', 'USD'],
      ['visa', 'VISA'],
    ]

    for (const [input, expected] of acronyms) {
      expect(formatCategoryName(input)).toBe(expected)
    }
  })

  it('handles a mix of acronym and regular words', () => {
    expect(formatCategoryName('usd_transfers')).toBe('USD Transfers')
    expect(formatCategoryName('amex-credit_card')).toBe('AMEX Credit Card')
    expect(formatCategoryName('online_shopping_bnpl')).toBe('Online Shopping BNPL')
  })

  it('handles an empty string without throwing', () => {
    expect(formatCategoryName('')).toBe('')
  })
})
