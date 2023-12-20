import { alpha } from '@mui/system'
import { DragEvent, useCallback, useMemo, useState } from 'react'
import useTheme from '~/hooks/useTheme'
import { Entry } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { move } from '~/store/explorer'

const mime = 'application/zephy.path-list'

const getPaths = (e: DragEvent) => {
  try {
    const json = e.dataTransfer.getData(mime)
    return JSON.parse(json) as string[]
  } catch (e) {
    // noop
  }
  return Array.from(e.dataTransfer.files).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (file) => (file as any).path,
  ) as string[]
}

const useDropEntry = (entry: Entry) => {
  const dispatch = useAppDispatch()

  const { theme } = useTheme()

  const droppable = useMemo(() => entry.type === 'directory', [entry])

  const [enterCount, setEnterCount] = useState(0)

  const dropping = useMemo(() => enterCount > 0, [enterCount])

  const droppableStyle = useMemo(
    () => ({
      position: 'relative',
      ...(dropping
        ? {
            '::before': {
              backgroundColor: alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity,
              ),
              content: '""',
              inset: 0,
              pointerEvents: 'none',
              position: 'absolute',
            },
          }
        : {}),
    }),
    [dropping, theme],
  )

  const onDragEnter = useCallback(
    (e: DragEvent) => {
      if (!droppable) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      setEnterCount((count) => count + 1)
    },
    [droppable],
  )

  const onDragLeave = useCallback(
    (e: DragEvent) => {
      if (!droppable) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      setEnterCount((count) => count - 1)
    },
    [droppable],
  )

  const onDragOver = useCallback(
    (e: DragEvent) => {
      if (!droppable) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'move'
    },
    [droppable],
  )

  const onDrop = useCallback(
    (e: DragEvent) => {
      if (!droppable) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      setEnterCount(0)
      const paths = getPaths(e)
      dispatch(move(paths, entry.path))
    },
    [dispatch, droppable, entry.path],
  )

  return {
    droppableStyle,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  }
}

export default useDropEntry
