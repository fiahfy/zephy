import { useEffect } from 'react'
import { useAppDispatch } from '~/store'
import { back, forward, updateApplicationMenu } from '~/store/window'

const useEventListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handler = () => dispatch(updateApplicationMenu())

    window.addEventListener('focus', handler)

    return () => window.removeEventListener('focus', handler)
  }, [dispatch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
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

    document.addEventListener('keydown', handler)

    return () => document.removeEventListener('keydown', handler)
  }, [dispatch])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      switch (e.button) {
        case 3:
          return dispatch(back())
        case 4:
          return dispatch(forward())
      }
    }

    document.addEventListener('mousedown', handler)

    return () => document.removeEventListener('mousedown', handler)
  }, [dispatch])
}

export default useEventListener
