import { useContext } from 'react'
import { ExplorerContext } from '~/contexts/ExplorerContext'

const useExplorer = () => {
  const context = useContext(ExplorerContext)
  if (!context) {
    throw new Error('useExplorer must be used within a Provider')
  }
  return context
}

export default useExplorer
