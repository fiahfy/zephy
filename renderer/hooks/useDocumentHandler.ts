import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import { back, forward } from 'store/window'

const useDocumentHandler = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      switch (e.button) {
        case 3:
          return dispatch(back())
        case 4:
          return dispatch(forward())
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [dispatch])
}

export default useDocumentHandler
