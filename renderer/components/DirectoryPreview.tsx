import { Box, ImageList, ImageListItem, ImageListItemBar } from '@mui/material'
import fileUrl from 'file-url'
import { useEffect, useReducer } from 'react'

import PreviewMessageItem from 'components/PreviewMessageItem'
import useContextMenu from 'hooks/useContextMenu'
import { Content, Entry } from 'interfaces'
import { useAppSelector } from 'store'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { createThumbnailsIfNeeded, isHiddenFile } from 'utils/file'

type EntryWithThumbnail = Entry & { thumbnail: string }

type State = {
  loading: boolean
  entries: EntryWithThumbnail[]
}

type Action =
  | {
      type: 'loaded'
      payload: EntryWithThumbnail[]
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
  content: Content
}

const DirectoryPreview = (props: Props) => {
  const { content } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const { createEntryMenuHandler } = useContextMenu()

  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    entries: [],
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      let entries = await window.electronAPI.getEntries(content.path)
      entries = entries.filter(
        (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name)
      )
      const paths = entries.map((entry) => entry.path)
      const thumbnails = await createThumbnailsIfNeeded(paths)
      const newEntries = entries.reduce((acc, entry, i) => {
        const thumbnail = thumbnails[i]
        return thumbnail ? [...acc, { ...entry, thumbnail }] : acc
      }, [] as EntryWithThumbnail[])
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: newEntries })
    })()

    return () => {
      unmounted = true
    }
  }, [content, shouldShowHiddenFiles])

  const handleDoubleClick = async (entry: Entry) =>
    await window.electronAPI.openPath(entry.path)

  return (
    <ImageList cols={1} gap={1}>
      {state.loading && <PreviewMessageItem message="Loading..." />}
      {!state.loading && (
        <>
          {state.entries.length > 0 ? (
            state.entries.map((entry) => (
              <ImageListItem
                key={entry.path}
                onContextMenu={createEntryMenuHandler(entry)}
                onDoubleClick={() => handleDoubleClick(entry)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    '.overlay': {
                      backgroundColor: (theme) => theme.palette.action.hover,
                    },
                  },
                }}
                tabIndex={0}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  src={fileUrl(entry.thumbnail)}
                  style={{
                    aspectRatio: '16 / 9',
                    objectFit: 'contain',
                  }}
                />
                <ImageListItemBar
                  subtitle={entry.name}
                  sx={{
                    '.MuiImageListItemBar-titleWrap': {
                      p: 1,
                    },
                  }}
                />
                <Box
                  className="overlay"
                  sx={{
                    inset: 0,
                    pointerEvents: 'none',
                    position: 'absolute',
                  }}
                />
              </ImageListItem>
            ))
          ) : (
            <PreviewMessageItem message="No Preview" />
          )}
        </>
      )}
    </ImageList>
  )
}

export default DirectoryPreview
