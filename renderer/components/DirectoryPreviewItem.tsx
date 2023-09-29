import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import EntryIcon from '~/components/EntryIcon'
import useDnd from '~/hooks/useDnd'
import useEntryItem from '~/hooks/useEntryItem'
import { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { changeDirectory } from '~/store/window'
import { isHiddenFile } from '~/utils/file'

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

const DirectoryPreviewItem = (props: Props) => {
  const { entry } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const appDispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { createDraggableBinder, createDroppableBinder, droppableStyle } =
    useDnd()

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
          const entries = await window.electronAPI.entry.getEntries(entry.path)
          return entries
            .filter(
              (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name),
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((entry) => entry.path)
        } catch (e) {
          return []
        }
      })()
      const thumbnail = await window.electronAPI.entry.createThumbnailUrl(paths)
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: thumbnail })
    })()

    return () => {
      unmounted = true
    }
  }, [entry.path, entry.type, entry.url, shouldShowHiddenFiles])

  const message = useMemo(
    () => (loading ? 'Loading...' : 'No preview'),
    [loading],
  )

  const handleDoubleClick = useCallback(
    async () =>
      entry.type === 'directory'
        ? appDispatch(changeDirectory(entry.path))
        : await window.electronAPI.entry.open(entry.path),
    [appDispatch, entry.path, entry.type],
  )

  return (
    <ImageListItem
      onContextMenu={onContextMenu}
      onDoubleClick={handleDoubleClick}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          '.overlay': {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        },
        ...droppableStyle,
      }}
      tabIndex={0}
      {...createDraggableBinder(entry)}
      {...createDroppableBinder(entry)}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
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
          <Box ml={1} mr={0.5} sx={{ display: 'flex' }}>
            <EntryIcon entry={entry} />
          </Box>
        }
        actionPosition="left"
        sx={{
          '.MuiImageListItemBar-titleWrap': {
            p: 0,
          },
        }}
        title={
          <Typography title={entry.name} variant="caption">
            {entry.name}
          </Typography>
        }
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
  )
}

export default DirectoryPreviewItem
