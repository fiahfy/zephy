import { useContext } from 'react'
import { WatcherContext } from '~/contexts/WatcherContext'

const useWatcher = () => {
  const context = useContext(WatcherContext)
  if (!context) {
    throw new Error('useWatcher must be used within a Provider')
  }
  return context
}

export default useWatcher
