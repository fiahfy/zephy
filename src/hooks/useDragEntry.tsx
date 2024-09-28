import { Box, Typography } from '@mui/material'
import { type DragEvent, useCallback, useMemo } from 'react'
import useDragGhost from '~/hooks/useDragGhost'
import type { Entry } from '~/interfaces'

const mime = 'application/zephy.path-list'

const setPaths = (e: DragEvent, paths: string[]) =>
  e.dataTransfer.setData(mime, JSON.stringify(paths))

const useDragEntry = (entries: Entry | Entry[]) => {
  const { render } = useDragGhost()

  const targetEntries = useMemo(
    () => (Array.isArray(entries) ? entries : [entries]),
    [entries],
  )

  const draggable = useMemo(() => targetEntries.length > 0, [targetEntries])

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
      const ref = render(
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {targetEntries.map((entry) => (
            <Typography key={entry.path} variant="caption">
              {entry.name}
            </Typography>
          ))}
        </Box>,
      )
      if (ref.current) {
        e.dataTransfer.setDragImage(ref.current, 0, 0)
      }
      const paths = targetEntries.map((e) => e.path)
      setPaths(e, paths)
    },
    [draggable, render, targetEntries],
  )

  return {
    draggable,
    onDragEnd,
    onDragStart,
  }
}

export default useDragEntry
