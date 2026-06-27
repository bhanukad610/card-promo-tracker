import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSavedPromos } from './useSavedPromos'
import type { Promo } from '../types/promo'

const makePromo = (overrides: Partial<Promo> = {}): Promo => ({
  id: 'hnb:1',
  rawId: 1,
  bankId: 'hnb',
  title: 'Test Promo',
  thumb: '',
  merchant: 'Test Merchant',
  cardType: 'Credit',
  to: '31 Dec 2099',
  valid: 'Valid till 31 Dec 2099',
  ...overrides,
})

const STORAGE_KEY = 'saved-promos-v1'

beforeEach(() => {
  localStorage.clear()
})

describe('useSavedPromos', () => {
  it('starts with an empty list when localStorage is empty', () => {
    const { result } = renderHook(() => useSavedPromos())
    expect(result.current.savedPromos).toEqual([])
    expect(result.current.savedPromoIds.size).toBe(0)
  })

  it('adds a promo when toggled', () => {
    const { result } = renderHook(() => useSavedPromos())
    const promo = makePromo()

    act(() => {
      result.current.toggleSavedPromo(promo)
    })

    expect(result.current.savedPromos).toHaveLength(1)
    expect(result.current.savedPromos[0].id).toBe('hnb:1')
    expect(result.current.savedPromoIds.has('hnb:1')).toBe(true)
  })

  it('removes a promo when toggled a second time', () => {
    const { result } = renderHook(() => useSavedPromos())
    const promo = makePromo()

    act(() => {
      result.current.toggleSavedPromo(promo)
    })
    act(() => {
      result.current.toggleSavedPromo(promo)
    })

    expect(result.current.savedPromos).toHaveLength(0)
    expect(result.current.savedPromoIds.has('hnb:1')).toBe(false)
  })

  it('persists saved promos to localStorage', () => {
    const { result } = renderHook(() => useSavedPromos())
    const promo = makePromo()

    act(() => {
      result.current.toggleSavedPromo(promo)
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Promo[]
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe('hnb:1')
  })

  it('reads back previously saved promos from localStorage on mount', () => {
    const promo = makePromo()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([promo]))

    const { result } = renderHook(() => useSavedPromos())

    expect(result.current.savedPromos).toHaveLength(1)
    expect(result.current.savedPromos[0].id).toBe('hnb:1')
    expect(result.current.savedPromoIds.has('hnb:1')).toBe(true)
  })

  it('returns an empty list when localStorage contains corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json')

    const { result } = renderHook(() => useSavedPromos())
    expect(result.current.savedPromos).toEqual([])
  })

  it('returns an empty list when localStorage contains a non-array value', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 1 }))

    const { result } = renderHook(() => useSavedPromos())
    expect(result.current.savedPromos).toEqual([])
  })

  it('migrates legacy numeric promo IDs to composite string IDs', () => {
    const legacyPromo = { ...makePromo(), id: 42 as unknown as string, rawId: undefined }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([legacyPromo]))

    const { result } = renderHook(() => useSavedPromos())

    expect(result.current.savedPromos[0].id).toBe('hnb:42')
    expect(result.current.savedPromos[0].rawId).toBe(42)
  })

  it('prepends newly saved promos to the top of the list', () => {
    const first = makePromo({ id: 'hnb:1', rawId: 1, title: 'First' })
    const second = makePromo({ id: 'hnb:2', rawId: 2, title: 'Second' })

    const { result } = renderHook(() => useSavedPromos())

    act(() => {
      result.current.toggleSavedPromo(first)
    })
    act(() => {
      result.current.toggleSavedPromo(second)
    })

    expect(result.current.savedPromos[0].id).toBe('hnb:2')
    expect(result.current.savedPromos[1].id).toBe('hnb:1')
  })
})
