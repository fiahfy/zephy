import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  useMediaQuery,
} from '@mui/material'
import { type ReactNode, useEffect, useMemo } from 'react'
import ThemeContext from '~/contexts/ThemeContext'
import { useAppSelector } from '~/store'
import { selectTheme } from '~/store/settings'

type Props = { children: ReactNode }

const ThemeProvider = (props: Props) => {
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
    if (mode === 'light') {
      document.body.classList.remove('theme-dark')
      document.body.classList.add('theme-light')
    } else {
      document.body.classList.remove('theme-light')
      document.body.classList.add('theme-dark')
    }
  }, [mode])

  const theme = useMemo(() => {
    const palette = {
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
    }
    const components = {
      MuiStack: {
        defaultProps: {
          useFlexGap: true,
        },
      },
    }
    const theme = createTheme({
      palette,
      components,
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

export default ThemeProvider
