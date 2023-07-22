import { MouseEvent, useEffect, useRef } from 'react'

const usePreventClickOnDoubleClick = <T>(
  onBeforeClick: (e: MouseEvent, ...args: T[]) => void,
  onClick: (e: MouseEvent, ...args: T[]) => void,
  onDoubleClick: (e: MouseEvent, ...args: T[]) => void,
) => {
  const timer = useRef<number>()

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  const handleClick = (e: MouseEvent, ...args: T[]) => {
    onBeforeClick(e, ...args)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onClick(e, ...args), 300)
  }

  const handleDoubleClick = (e: MouseEvent, ...args: T[]) => {
    window.clearTimeout(timer.current)
    onDoubleClick(e, ...args)
  }

  return { handleClick, handleDoubleClick }
}

export default usePreventClickOnDoubleClick
