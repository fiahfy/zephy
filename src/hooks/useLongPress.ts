import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

const useLongPress = (callback: (e: MouseEvent) => void, timeout = 400) => {
  const [pressing, setPressing] = useState(false)

  const timer = useRef(0)

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      setPressing(true)
      timer.current = window.setTimeout(() => {
        setPressing(false)
        callback(e)
      }, timeout)
    },
    [callback, timeout],
  )

  const onMouseUp = useCallback(() => {
    window.clearTimeout(timer.current)
    setPressing(false)
  }, [])

  const onMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (pressing) {
        window.clearTimeout(timer.current)
        setPressing(false)
        callback(e)
      }
    },
    [callback, pressing],
  )

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  return { onMouseDown, onMouseUp, onMouseLeave }
}

export default useLongPress
