import { MouseEvent, MouseEventHandler, useEffect, useRef } from 'react'

const usePreventClickOnDoubleClick = <T>(
  onBeforeClick: MouseEventHandler<T>,
  onClick: MouseEventHandler<T>,
  onDoubleClick: MouseEventHandler<T>
) => {
  const timer = useRef<number>()

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  const handleClick = (e: MouseEvent<T>) => {
    onBeforeClick(e)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onClick(e), 300)
  }

  const handleDoubleClick = (e: MouseEvent<T>) => {
    window.clearTimeout(timer.current)
    onDoubleClick(e)
  }

  return { handleClick, handleDoubleClick }
}

export default usePreventClickOnDoubleClick
