import { type DragEvent, type JSX, useCallback, useMemo } from 'react'
import useDragGhost from '~/hooks/useDragGhost'

const mime = 'application/zephy.path-list'

const setPaths = (e: DragEvent, paths: string[]) =>
  e.dataTransfer.setData(mime, JSON.stringify(paths))

const useDraggable = (paths: string | string[], ghost: JSX.Element) => {
  const { render } = useDragGhost()

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
      render(null)
    },
    [draggable, render],
  )

  const onDragStart = useCallback(
    (e: DragEvent) => {
      if (!draggable) {
        return
      }
      // TODO: native drag and drop
      // @see https://www.electronjs.org/ja/docs/latest/tutorial/native-file-drag-drop
      // e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.effectAllowed = 'move'

      const ref = render(ghost)
      if (ref.current) {
        e.dataTransfer.setDragImage(ref.current, 0, 0)
      }

      setPaths(e, targetPaths)
    },
    [draggable, ghost, render, targetPaths],
  )

  return {
    draggable,
    onDragEnd,
    onDragStart,
  }
}

export default useDraggable
