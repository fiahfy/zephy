import type { Theme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'
import { type DragEvent, useCallback, useMemo, useState } from 'react'
import useTheme from '~/hooks/useTheme'
import { useAppDispatch } from '~/store'
import { move } from '~/store/explorer-list'

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
      }) as SystemStyleObject<Theme>,
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
      const files = Array.from(e.dataTransfer.files)
      const paths = window.electronAPI.getFilePaths(files)
      dispatch(move(paths, path))
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
