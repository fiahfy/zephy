import { useContext } from 'react'
import { ThumbnailContext } from '~/contexts/ThumbnailContext'

const useThumbnail = () => {
  const context = useContext(ThumbnailContext)
  if (!context) {
    throw new Error('useThumbnail must be used within a Provider')
  }
  return context
}

export default useThumbnail
