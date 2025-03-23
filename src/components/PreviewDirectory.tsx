import { Box } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import throttle from 'lodash.throttle'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import PreviewDirectoryItem from '~/components/PreviewDirectoryItem'
import PreviewEmptyState from '~/components/PreviewEmptyState'
import type { Entry } from '~/interfaces'
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

const PreviewDirectory = (props: Props) => {
  const { entry } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const [{ loading, entries }, dispatch] = useReducer(reducer, {
    loading: false,
    entries: [],
  })

  const ref = useRef<HTMLDivElement>(null)

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / maxItemSize) || 1,
    [wrapperWidth],
  )

  const size = useMemo(() => wrapperWidth / columns, [columns, wrapperWidth])

  const rows = useMemo(
    () =>
      entries.reduce((acc, _, i) => {
        if (i % columns === 0) {
          acc.push(entries.slice(i, i + columns))
        }
        return acc
      }, [] as Entry[][]),
    [columns, entries],
  )

  const noDataText = useMemo(
    () => (loading ? 'Loading...' : 'No items'),
    [loading],
  )

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => size,
    getScrollElement: () => ref.current,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const handleResize = throttle((entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      console.log(entry)
      if (entry) {
        setWrapperWidth(entry.contentRect.width)
      }
    }, 100)
    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => virtualizer.measure(), [virtualizer, size])

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
        ref={ref}
        sx={{
          overflowX: 'hidden',
          overflowY: 'scroll',
        }}
      >
        {wrapperWidth > 0 && (
          <Box
            sx={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const columns = rows[virtualRow.index] as Entry[]
              return (
                <Box
                  key={virtualRow.index}
                  sx={{
                    display: 'flex',
                    height: `${virtualRow.size}px`,
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {columns.map((entry) => (
                    <Box
                      key={entry.path}
                      sx={{ p: 0.0625, width: virtualRow.size }}
                    >
                      <PreviewDirectoryItem entry={entry} />
                    </Box>
                  ))}
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
      {entries.length === 0 && <PreviewEmptyState message={noDataText} />}
    </>
  )
}

export default PreviewDirectory
