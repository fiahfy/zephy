import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import fileUrl from 'file-url'
import { useCallback, useEffect, useMemo, useReducer } from 'react'

import EntryIcon from 'components/EntryIcon'
import Outline from 'components/Outline'
import useContextMenu from 'hooks/useContextMenu'
import useDnd from 'hooks/useDnd'
import { Entry } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { changeDirectory } from 'store/window'
import { createThumbnailIfNeeded, isHiddenFile } from 'utils/file'

type State = {
  loading: boolean
  thumbnail?: string
}

type Action =
  | {
      type: 'loaded'
      payload?: string
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        loading: false,
        thumbnail: action.payload,
      }
    case 'loading':
      return { loading: true, thumbnail: undefined }
  }
}

type Props = {
  entry: Entry
}

const DirectoryPreviewListItem = (props: Props) => {
  const { entry } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const appDispatch = useAppDispatch()

  const { createEntryMenuHandler } = useContextMenu()
  const { createDraggableBinder, createDroppableBinder, dropping } = useDnd()

  const [{ loading, thumbnail }, dispatch] = useReducer(reducer, {
    loading: false,
    thumbnail: undefined,
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      const paths = await (async () => {
        if (entry.type === 'file') {
          return [entry.path]
        }

        try {
          const entries = await window.electronAPI.getEntries(entry.path)
          return entries
            .filter(
              (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name),
            )
            .map((entry) => entry.path)
        } catch (e) {
          return []
        }
      })()
      const thumbnail = await createThumbnailIfNeeded(paths)
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: thumbnail })
    })()

    return () => {
      unmounted = true
    }
  }, [entry.path, entry.type, shouldShowHiddenFiles])

  const message = useMemo(
    () => (loading ? 'Loading...' : 'No Preview'),
    [loading],
  )

  const handleDoubleClick = useCallback(
    async (entry: Entry) =>
      entry.type === 'directory'
        ? appDispatch(changeDirectory(entry.path))
        : await window.electronAPI.openPath(entry.path),
    [appDispatch],
  )

  return (
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
      {...createDraggableBinder(entry)}
      {...createDroppableBinder(entry)}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          loading="lazy"
          src={fileUrl(thumbnail)}
          style={{
            aspectRatio: '16 / 9',
            objectPosition: 'center top',
          }}
        />
      ) : (
        <Box
          sx={{
            alignItems: 'center',
            aspectRatio: '16 / 9',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">{message}</Typography>
        </Box>
      )}
      <ImageListItemBar
        actionIcon={
          <Box mx={1} sx={{ display: 'flex' }}>
            <EntryIcon entry={entry} />
          </Box>
        }
        actionPosition="left"
        sx={{
          '.MuiImageListItemBar-titleWrap': {
            p: 0,
          },
        }}
        title={<Typography variant="caption">{entry.name}</Typography>}
      />
      <Box
        className="overlay"
        sx={{
          inset: 0,
          pointerEvents: 'none',
          position: 'absolute',
        }}
      />
      {dropping && <Outline />}
    </ImageListItem>
  )
}

export default DirectoryPreviewListItem
