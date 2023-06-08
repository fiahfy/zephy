import { CssBaseline, Theme } from '@mui/material'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles'
import { ReactNode, createContext, useContext, useEffect, useMemo } from 'react'

import { useTitleBar } from 'contexts/TitleBarContext'
import { useAppSelector } from 'store'
import { selectDarkMode } from 'store/settings'

const ThemeContext = createContext<
  | {
      theme: Theme
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const ThemeProvider = (props: Props) => {
  const { children } = props

  const darkMode = useAppSelector(selectDarkMode)

  const { visible } = useTitleBar()

  const mode = darkMode ? 'dark' : 'light'

  useEffect(() => {
    if (mode === 'dark') {
      document.body.classList.remove('theme-light')
      document.body.classList.add('theme-dark')
    } else {
      document.body.classList.remove('theme-dark')
      document.body.classList.add('theme-light')
    }
  }, [mode])

  const theme = useMemo(() => {
    const theme = createTheme({
      palette: {
        mode,
        primary: {
          main: '#ff4081',
        },
        // secondary: {
        //   main: '#19857b',
        // },
        // error: {
        //   main: colors.red.A400,
        // },
      },
    })
    return createTheme(theme, {
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              top: visible ? theme.spacing(3.5) : 0,
            },
          },
        },
      },
      mixins: {
        titleBar: {
          height: visible ? theme.spacing(3.5) : 0,
        },
      },
    })
  }, [mode, visible])

  const value = { theme }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a Provider')
  }
  return context
}
