import { Box, Stack } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import throttle from 'lodash.throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import PreviewDirectoryItem from '~/components/PreviewDirectoryItem'
import PreviewEmptyState from '~/components/PreviewEmptyState'
import type { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  load,
  selectContents,
  selectError,
  selectLoading,
  selectPreviewContent,
} from '~/store/preview'

const maxItemSize = 256

const PreviewDirectory = () => {
  const contents = useAppSelector(selectContents)
  const error = useAppSelector(selectError)
  const loading = useAppSelector(selectLoading)
  const previewContent = useAppSelector(selectPreviewContent)
  const dispatch = useAppDispatch()

  const ref = useRef<HTMLDivElement>(null)

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / maxItemSize) || 1,
    [wrapperWidth],
  )

  const size = useMemo(() => wrapperWidth / columns, [columns, wrapperWidth])

  const chunks = useMemo(
    () =>
      contents.reduce((acc, _, i) => {
        if (i % columns === 0) {
          acc.push(contents.slice(i, i + columns))
        }
        return acc
      }, [] as Content[][]),
    [columns, contents],
  )

  const virtualizer = useVirtualizer({
    count: chunks.length,
    estimateSize: () => size,
    getScrollElement: () => ref.current,
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    dispatch(load())
  }, [dispatch, previewContent?.url])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const handleResize = throttle((entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (entry) {
        setWrapperWidth(entry.contentRect.width)
      }
    }, 100)
    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!loading) {
      virtualizer.scrollToOffset(0)
    }
  }, [loading, virtualizer])

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => virtualizer.measure(), [virtualizer, size])

  const noDataText = useMemo(
    () =>
      loading
        ? 'Loading items...'
        : error
          ? 'The specified directory does not exist'
          : 'No items',
    [loading, error],
  )

  return (
    <>
      <Box
        ref={ref}
        sx={{
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'scroll',
          display: chunks.length === 0 ? 'none' : 'block',
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
              const columns = chunks[virtualRow.index] as Content[]
              return (
                <Stack
                  direction="row"
                  key={virtualRow.index}
                  sx={{
                    height: `${virtualRow.size}px`,
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {columns.map((content) => (
                    <Box
                      key={content.path}
                      sx={{ p: 0.0625, width: virtualRow.size }}
                    >
                      <PreviewDirectoryItem content={content} />
                    </Box>
                  ))}
                </Stack>
              )
            })}
          </Box>
        )}
      </Box>
      {chunks.length === 0 && <PreviewEmptyState message={noDataText} />}
    </>
  )
}

export default PreviewDirectory
