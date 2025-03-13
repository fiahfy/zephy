import type { SxProps, Theme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { type DragEvent, useCallback, useMemo, useState } from 'react'
import useTheme from '~/hooks/useTheme'
import { useAppDispatch } from '~/store'
import { moveFromCurrentTab } from '~/store/explorer-list'

const mime = 'application/zephy.path-list'

const getPaths = (e: DragEvent) => {
  try {
    const json = e.dataTransfer.getData(mime)
    return JSON.parse(json) as string[]
  } catch (e) {
    // noop
  }
  return Array.from(e.dataTransfer.files).map(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (file) => (file as any).path,
  ) as string[]
}

const isDroppable = (path?: string): path is string => path !== undefined

const useDroppable = (path?: string) => {
  const dispatch = useAppDispatch()

  const { theme } = useTheme()

  const droppable = isDroppable(path)

  const [enterCount, setEnterCount] = useState(0)

  const dropping = useMemo(() => enterCount > 0, [enterCount])

  const droppableStyle = useMemo(
    () =>
      ({
        position: 'relative',
        ...(dropping
          ? {
              '::after': {
                backgroundColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.activatedOpacity,
                ),
                borderRadius: theme.spacing(0.5),
                content: '""',
                inset: 0,
                pointerEvents: 'none',
                position: 'absolute',
              },
            }
          : {}),
      }) as SxProps<Theme>,
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
      dispatch(moveFromCurrentTab(paths, path))
    },
    [dispatch, droppable, path],
  )

  return {
    droppableStyle,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  }
}

export default useDroppable
