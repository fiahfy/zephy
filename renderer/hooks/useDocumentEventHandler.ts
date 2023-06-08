import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import { back, forward } from 'store/window'

const useDocumentEventHandler = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
            return dispatch(back())
          }
          break
        case 'ArrowRight':
          if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
            return dispatch(forward())
          }
          break
      }
    }
    const handleMouseDown = (e: MouseEvent) => {
      switch (e.button) {
        case 3:
          return dispatch(back())
        case 4:
          return dispatch(forward())
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [dispatch])
}

export default useDocumentEventHandler
