import { useContext } from 'react'
import { ThemeContext } from '~/contexts/ThemeContext'

const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a Provider')
  }
  return context
}

export default useTheme
