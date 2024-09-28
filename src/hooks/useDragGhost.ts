import { useContext } from 'react'
import DragGhostContext from '~/contexts/DragGhostContext'

const useDragGhost = () => {
  const context = useContext(DragGhostContext)
  if (!context) {
    throw new Error('useDragGhost must be used within a Provider')
  }
  return context
}

export default useDragGhost
