import { ImageList, ImageListItem } from '@mui/material'
import pluralize from 'pluralize'
import { useEffect, useMemo, useReducer } from 'react'

import DirectoryPreviewItem from 'components/DirectoryPreviewItem'
import MessagePreview from 'components/MessagePreview'
import { Entry } from 'interfaces'
import { useAppSelector } from 'store'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { isHiddenFile } from 'utils/file'

const max = 100

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

  const over = useMemo(() => entries.length - max, [entries])

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      let entries = await window.electronAPI.getEntries(entry.path)
      entries = entries
        .filter((entry) => shouldShowHiddenFiles || !isHiddenFile(entry.path))
        .sort((a, b) => a.name.localeCompare(b.name))
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
      {loading ? (
        <MessagePreview message="Loading..." />
      ) : (
        <>
          {entries.length > 0 ? (
            <ImageList cols={1} gap={1} sx={{ m: 0 }}>
              {entries.slice(0, max).map((entry) => (
                <DirectoryPreviewItem entry={entry} key={entry.path} />
              ))}
              {over > 0 && (
                <ImageListItem>
                  <MessagePreview
                    message={`Other ${pluralize('item', over, true)}`}
                  />
                </ImageListItem>
              )}
            </ImageList>
          ) : (
            <MessagePreview message="No items" />
          )}
        </>
      )}
    </>
  )
}

export default DirectoryPreview
