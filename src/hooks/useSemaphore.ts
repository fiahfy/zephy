import { useContext } from 'react'
import SemaphoreContext from '~/contexts/SemaphoreContext'

const useSemaphore = () => {
  const context = useContext(SemaphoreContext)
  if (!context) {
    throw new Error('useSemaphore must be used within a Provider')
  }
  return context
}

export default useSemaphore
