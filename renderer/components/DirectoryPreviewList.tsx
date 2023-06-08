import { ImageList } from '@mui/material'
import { useEffect, useReducer } from 'react'

import DirectoryPreviewListItem from 'components/DirectoryPreviewListItem'
import MessagePreviewListItem from 'components/MessagePreviewListItem'
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

const DirectoryPreviewList = (props: Props) => {
  const { entry } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const [{ loading, entries }, dispatch] = useReducer(reducer, {
    loading: false,
    entries: [],
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      let entries = await window.electronAPI.getEntries(entry.path)
      entries = entries
        .filter((entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name))
        .slice(0, max)
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: entries })
    })()

    return () => {
      unmounted = true
    }
  }, [entry, shouldShowHiddenFiles])

  return (
    <ImageList cols={1} gap={1} sx={{ m: 0 }}>
      {loading ? (
        <MessagePreviewListItem message="Loading..." />
      ) : (
        <>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <DirectoryPreviewListItem entry={entry} key={entry.path} />
            ))
          ) : (
            <MessagePreviewListItem message="No Items" />
          )}
        </>
      )}
    </ImageList>
  )
}

export default DirectoryPreviewList
