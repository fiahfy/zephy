import { Box, ImageList, ImageListItem } from '@mui/material'
import pluralize from 'pluralize'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import DirectoryPreviewItem from '~/components/DirectoryPreviewItem'
import EmptyPreview from '~/components/EmptyPreview'
import { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { isHiddenFile } from '~/utils/file'

const maxItems = 100
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

  const ref = useRef<HTMLDivElement>(null)

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / maxItemSize) || 1,
    [wrapperWidth],
  )
  const over = useMemo(() => entries.length - maxItems, [entries])
  const noDataText = useMemo(
    () => (loading ? 'Loading...' : 'No items'),
    [loading],
  )

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

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      const entries = await (async () => {
        try {
          const entries = await window.electronAPI.entry.getEntries(entry.path)
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
    <Box ref={ref}>
      {entries.length > 0 ? (
        // TODO: use virtualizer
        <ImageList cols={columns} gap={1} sx={{ m: 0 }}>
          {entries.slice(0, maxItems).map((entry) => (
            <DirectoryPreviewItem entry={entry} key={entry.path} />
          ))}
          {over > 0 && (
            <ImageListItem cols={columns}>
              <EmptyPreview
                message={`Other ${pluralize('item', over, true)}`}
                sx={{ aspectRatio: `${columns} / 1` }}
              />
            </ImageListItem>
          )}
        </ImageList>
      ) : (
        <EmptyPreview message={noDataText} />
      )}
    </Box>
  )
}

export default DirectoryPreview
