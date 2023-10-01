import { CssBaseline, Theme, useMediaQuery } from '@mui/material'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles'
import { ReactNode, createContext, useEffect, useMemo } from 'react'
import { useAppSelector } from '~/store'
import { selectTheme } from '~/store/settings'

export const ThemeContext = createContext<
  | {
      theme: Theme
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const ThemeProvider = (props: Props) => {
  const { children } = props

  const themeSetting = useAppSelector(selectTheme)

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const mode =
    themeSetting === 'system'
      ? prefersDarkMode
        ? 'dark'
        : 'light'
      : themeSetting

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
      mixins: {
        addressBar: {
          height: theme.spacing(4.75),
        },
        statusBar: {
          height: theme.spacing(2.75),
        },
      },
    })
  }, [mode])

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
