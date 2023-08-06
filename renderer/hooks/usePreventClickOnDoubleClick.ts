import { MouseEvent, useCallback, useEffect, useRef } from 'react'

const usePreventClickOnDoubleClick = <T>(
  onBeforeClick: (e: MouseEvent, ...args: T[]) => void,
  onClick: (e: MouseEvent, ...args: T[]) => void,
  onDoubleClick: (e: MouseEvent, ...args: T[]) => void,
) => {
  const timer = useRef<number>()

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  const handleClick = useCallback(
    (e: MouseEvent, ...args: T[]) => {
      onBeforeClick(e, ...args)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => onClick(e, ...args), 300)
    },
    [onBeforeClick, onClick],
  )

  const handleDoubleClick = useCallback(
    (e: MouseEvent, ...args: T[]) => {
      window.clearTimeout(timer.current)
      onDoubleClick(e, ...args)
    },
    [onDoubleClick],
  )

  return { handleClick, handleDoubleClick }
}

export default usePreventClickOnDoubleClick
