import { createContext } from 'react'

export interface ThemeContextValue {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
