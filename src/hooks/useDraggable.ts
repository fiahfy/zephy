import { type DragEvent, useCallback, useMemo } from 'react'

const useDraggable = (paths: string | string[]) => {
  const targetPaths = useMemo(
    () => (Array.isArray(paths) ? paths : [paths]),
    [paths],
  )

  const draggable = useMemo(() => targetPaths.length > 0, [targetPaths])

  const onDragEnd = useCallback(
    (e: DragEvent) => {
      if (!draggable) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
    },
    [draggable],
  )

  const onDragStart = useCallback(
    (e: DragEvent) => {
      if (!draggable) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.effectAllowed = 'move'
      window.electronAPI.startDrag(targetPaths)
    },
    [draggable, targetPaths],
  )

  return {
    draggable,
    onDragEnd,
    onDragStart,
  }
}

export default useDraggable
