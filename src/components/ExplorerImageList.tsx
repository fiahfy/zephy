import { Box, Stack } from '@mui/material'
import throttle from 'lodash.throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import ExplorerEmptyState from '~/components/ExplorerEmptyState'
import ExplorerImageListItem from '~/components/ExplorerImageListItem'
import ExplorerLoadingProgress from '~/components/ExplorerLoadingProgress'
import useExplorerList from '~/hooks/useExplorerList'
import type { Content } from '~/interfaces'

const maxItemSize = 256

type Props = {
  tabId: number
}

const ExplorerImageList = (props: Props) => {
  const { tabId } = props

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const ref = useRef<HTMLDivElement>(null)

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / maxItemSize) || 1,
    [wrapperWidth],
  )
  const size = useMemo(() => wrapperWidth / columns, [columns, wrapperWidth])

  const {
    chunks,
    loading,
    noDataText,
    onClick,
    onContextMenu,
    onKeyDown,
    restoring,
    virtualizer,
  } = useExplorerList(tabId, columns, size, false, ref)

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

  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
      }}
    >
      <Box
        className="explorer-list"
        onClick={onClick}
        onContextMenu={onContextMenu}
        onKeyDown={onKeyDown}
        ref={ref}
        sx={{
          height: '100%',
          outline: 'none',
          overflowX: 'hidden',
          overflowY: 'scroll',
          visibility: restoring ? 'hidden' : undefined,
        }}
        tabIndex={0}
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
                      <ExplorerImageListItem content={content} tabId={tabId} />
                    </Box>
                  ))}
                </Stack>
              )
            })}
          </Box>
        )}
      </Box>
      {chunks.length === 0 && <ExplorerEmptyState message={noDataText} />}
      {loading && <ExplorerLoadingProgress />}
    </Box>
  )
}

export default ExplorerImageList
