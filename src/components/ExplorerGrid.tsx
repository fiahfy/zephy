import { Box, LinearProgress, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import ExplorerGridItem from '~/components/ExplorerGridItem'
import useExplorerList from '~/hooks/useExplorerList'
import type { Content } from '~/interfaces'

const maxItemSize = 256

type Props = {
  tabId: number
}

const ExplorerGrid = (props: Props) => {
  const { tabId } = props

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / maxItemSize) || 1,
    [wrapperWidth],
  )
  const size = useMemo(() => wrapperWidth / columns, [columns, wrapperWidth])

  const ref = useRef<HTMLDivElement>(null)

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
          <Box sx={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualizer.getVirtualItems().map((virtualRow, rowIndex) => {
              const columns = chunks[virtualRow.index] as Content[]
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
                  {columns.map((content) => (
                    <Box key={content.path} sx={{ p: 0.0625, width: size }}>
                      <ExplorerGridItem content={content} tabId={tabId} />
                    </Box>
                  ))}
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
      {chunks.length === 0 && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            inset: 0,
            justifyContent: 'center',
            position: 'absolute',
          }}
        >
          <Typography variant="caption">{noDataText}</Typography>
        </Box>
      )}
      {loading && (
        <LinearProgress
          sx={{ inset: '0 0 auto', position: 'absolute', zIndex: 1 }}
        />
      )}
    </Box>
  )
}

export default ExplorerGrid
