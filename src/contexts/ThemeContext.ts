import type { Theme } from '@mui/material'
import { createContext } from 'react'

const ThemeContext = createContext<
  | {
      theme: Theme
    }
  | undefined
>(undefined)

export default ThemeContext
