import { MouseEvent, useCallback, useEffect, useRef } from 'react'

const usePreventClickOnDoubleClick = <T>(
  beforeClickCallback: (e: MouseEvent, ...args: T[]) => void,
  clickCallback: (e: MouseEvent, ...args: T[]) => void,
  doubleClickCallback: (e: MouseEvent, ...args: T[]) => void,
) => {
  const timer = useRef<number>()

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  const onClick = useCallback(
    (e: MouseEvent, ...args: T[]) => {
      beforeClickCallback(e, ...args)
      window.clearTimeout(timer.current)
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
