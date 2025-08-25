import { type KeyboardEvent, type MouseEvent, useCallback } from 'react'

const useButtonBehavior = (callback: (e?: MouseEvent) => void) => {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        callback()
      }
    },
    [callback],
  )

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        callback()
      }
    },
    [callback],
  )

  return {
    role: 'button',
    tabIndex: 0,
    onClick: callback,
    onKeyDown,
    onKeyUp,
  }
}

export default useButtonBehavior
