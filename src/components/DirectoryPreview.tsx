import { Box } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import DirectoryPreviewItem from '~/components/DirectoryPreviewItem'
import EmptyPreview from '~/components/EmptyPreview'
import { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { isHiddenFile } from '~/utils/file'

const maxItemSize = 256

type State = {
  loading: boolean
  entries: Entry[]
}

type Action =
  | {
      type: 'loaded'
      payload: Entry[]
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        loading: false,
        entries: action.payload,
      }
    case 'loading':
      return { loading: true, entries: [] }
  }
}

type Props = {
  entry: Entry
}

const DirectoryPreview = (props: Props) => {
  const { entry } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const [{ loading, entries }, dispatch] = useReducer(reducer, {
    loading: false,
    entries: [],
  })

  const parentRef = useRef<HTMLDivElement>(null)

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / maxItemSize) || 1,
    [wrapperWidth],
  )
  const rows = useMemo(
    () =>
      entries.reduce(
        (acc, _, i) =>
          i % columns ? acc : [...acc, entries.slice(i, i + columns)],
        [] as Entry[][],
      ),
    [columns, entries],
  )
  const size = useMemo(() => wrapperWidth / columns, [columns, wrapperWidth])

  const noDataText = useMemo(
    () => (loading ? 'Loading...' : 'No items'),
    [loading],
  )

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => size,
    getScrollElement: () => parentRef.current,
  })

  useEffect(() => {
    const el = parentRef.current
    if (!el) {
      return
    }
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (entry) {
        setWrapperWidth(entry.contentRect.width)
      }
    }
    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!loading) {
      virtualizer.scrollToOffset(0)
    }
  }, [loading, virtualizer])

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      dispatch({ type: 'loading' })
      const entries = await (async () => {
        try {
          const entries = await window.electronAPI.getEntries(entry.path)
          return entries
            .filter(
              (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name),
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        } catch (e) {
          return []
        }
      })()
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: entries })
    })()

    return () => {
      unmounted = true
    }
  }, [entry.path, shouldShowHiddenFiles])

  return (
    <>
      <Box
        ref={parentRef}
        sx={{
          overflowX: 'hidden',
          overflowY: 'scroll',
        }}
      >
        {wrapperWidth > 0 && (
          <Box sx={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualizer.getVirtualItems().map((virtualRow, rowIndex) => {
              const columns = rows[virtualRow.index] as Entry[]
              return (
                <Box
                  key={virtualRow.index}
                  sx={{
                    display: 'flex',
                    height: size,
                    transform: `translateY(${
                      virtualRow.start - rowIndex * virtualRow.size
                    }px)`,
                  }}
                >
                  {columns.map((entry) => (
                    <Box key={entry.path} sx={{ p: 0.0625, width: size }}>
                      <DirectoryPreviewItem entry={entry} />
                    </Box>
                  ))}
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
      {entries.length === 0 && <EmptyPreview message={noDataText} />}
    </>
  )
}

export default DirectoryPreview
