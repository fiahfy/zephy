import { type MouseEvent, useCallback, useEffect, useRef } from 'react'

const usePreventClickOnDoubleClick = <T>(
  beforeClickCallback: (e: MouseEvent, ...args: T[]) => void,
  clickCallback: (e: MouseEvent, ...args: T[]) => void,
  doubleClickCallback: (e: MouseEvent, ...args: T[]) => void,
) => {
  const timer = useRef(0)

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  const onClick = useCallback(
    (e: MouseEvent, ...args: T[]) => {
      window.clearTimeout(timer.current)
      beforeClickCallback(e, ...args)
      timer.current = window.setTimeout(() => clickCallback(e, ...args), 300)
    },
    [beforeClickCallback, clickCallback],
  )

  const onDoubleClick = useCallback(
    (e: MouseEvent, ...args: T[]) => {
      window.clearTimeout(timer.current)
      doubleClickCallback(e, ...args)
    },
    [doubleClickCallback],
  )

  return { onClick, onDoubleClick }
}

export default usePreventClickOnDoubleClick
