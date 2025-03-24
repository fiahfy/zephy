import { Box } from '@mui/material'
import throttle from 'lodash.throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import ExplorerEmptyState from '~/components/ExplorerEmptyState'
import ExplorerGalleryMain from '~/components/ExplorerGalleryMain'
import ExplorerImageListItem from '~/components/ExplorerImageListItem'
import ExplorerLoadingProgress from '~/components/ExplorerLoadingProgress'
import useExplorerList from '~/hooks/useExplorerList'
import type { Content } from '~/interfaces'

const maxItemSize = 256

type Props = {
  tabId: number
}

const ExplorerGallery = (props: Props) => {
  const { tabId } = props

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const size = useMemo(() => {
    const maxCount = Math.floor(wrapperWidth / maxItemSize)
    let n = Math.max(1, maxCount)

    while (true) {
      const candidateSize = wrapperWidth / (n + 0.3)
      if (candidateSize <= maxItemSize) {
        return candidateSize
      }
      n++
    }
  }, [wrapperWidth])

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
  } = useExplorerList(tabId, 1, size, true, ref)

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
    const el = ref.current
    if (!el) {
      return
    }
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      el.scrollLeft += e.deltaX
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', handleWheel)
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      <ExplorerGalleryMain tabId={tabId} />
      <Box
        className="explorer-list"
        onClick={onClick}
        onContextMenu={onContextMenu}
        onKeyDown={onKeyDown}
        ref={ref}
        sx={{
          flexShrink: 0,
          outline: 'none',
          overflowX: 'scroll',
          overflowY: 'hidden',
          visibility: restoring ? 'hidden' : undefined,
          width: '100%',
        }}
        tabIndex={0}
      >
        {wrapperWidth > 0 && (
          <Box
            sx={{
              height: size,
              position: 'relative',
              width: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {virtualizer.getVirtualItems().map((virtualColumn) => {
              const content = chunks[virtualColumn.index][0] as Content
              return (
                <Box
                  key={virtualColumn.index}
                  sx={{
                    display: 'flex',
                    height: `${virtualColumn.size}px`,
                    p: 0.0625,
                    position: 'absolute',
                    transform: `translateX(${virtualColumn.start}px)`,
                    width: `${virtualColumn.size}px`,
                  }}
                >
                  <ExplorerImageListItem content={content} tabId={tabId} />
                </Box>
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

export default ExplorerGallery
