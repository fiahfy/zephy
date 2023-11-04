import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import pluralize from 'pluralize'
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import NoOutlineRating from '~/components/mui/NoOutlineRating'
import EntryIcon from '~/components/EntryIcon'
import useDnd from '~/hooks/useDnd'
import useEntryItem from '~/hooks/useEntryItem'
import { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { openEntry, selectShouldShowHiddenFiles } from '~/store/settings'
import { changeDirectory } from '~/store/window'
import { isHiddenFile } from '~/utils/file'
import { rate, selectGetScore } from '~/store/rating'

type State = { itemCount: number; loading: boolean; thumbnail?: string }

type Action =
  | {
      type: 'loaded'
      payload: { itemCount: number; thumbnail?: string }
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        ...action.payload,
        loading: false,
      }
    case 'loading':
      return { itemCount: 0, loading: true, thumbnail: undefined }
  }
}

type Props = {
  entry: Entry
}

const DirectoryPreviewItem = (props: Props) => {
  const { entry } = props

  const getScore = useAppSelector(selectGetScore)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const appDispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { createDraggableBinder, createDroppableBinder, droppableStyle } =
    useDnd()

  const [{ itemCount, loading, thumbnail }, dispatch] = useReducer(reducer, {
    itemCount: 0,
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
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((entry) => entry.path)
        } catch (e) {
          return []
        }
      })()
      const thumbnail = await window.electronAPI.createEntryThumbnailUrl(paths)
      if (unmounted) {
        return
      }
      dispatch({
        type: 'loaded',
        payload: { itemCount: paths.length, thumbnail },
      })
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
        : appDispatch(openEntry(entry.path)),
    [appDispatch, entry.path, entry.type],
  )

  const handleChangeRating = useCallback(
    (_e: SyntheticEvent, value: number | null) =>
      appDispatch(rate({ path: entry.path, rating: value ?? 0 })),
    [appDispatch, entry.path],
  )

  // Rating component rendering is slow, so use useMemo to avoid unnecessary rendering
  const rating = useMemo(
    () => (
      <NoOutlineRating
        color="primary"
        onChange={handleChangeRating}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        precision={0.5}
        size="small"
        sx={{ my: 0.25 }}
        value={getScore(entry.path)}
      />
    ),
    [entry.path, getScore, handleChangeRating],
  )

  return (
    <ImageListItem
      onContextMenu={onContextMenu}
      onDoubleClick={handleDoubleClick}
      sx={{
        cursor: 'pointer',
        '::before': {
          content: '""',
          inset: 0,
          pointerEvents: 'none',
          position: 'absolute',
        },
        '&:hover': {
          '::before': {
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
        <img
          src={thumbnail}
          style={{
            aspectRatio: '1 / 1',
            objectPosition: 'center top',
          }}
        />
      ) : (
        <Box
          sx={{
            alignItems: 'center',
            aspectRatio: '1 / 1',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">{message}</Typography>
        </Box>
      )}
      <ImageListItemBar
        actionIcon={
          <Box ml={1} mr={0.5} mt={-2.5}>
            <EntryIcon entry={entry} />
          </Box>
        }
        actionPosition="left"
        subtitle={
          <Box
            sx={{
              alignItems: 'end',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {rating}
            {!loading && entry.type === 'directory' && (
              <Typography ml={1} noWrap variant="caption">
                {pluralize('item', itemCount, true)}
              </Typography>
            )}
          </Box>
        }
        sx={{
          '.MuiImageListItemBar-titleWrap': {
            overflow: 'visible',
            p: 0,
            pb: 0.5,
            pr: 1,
            '.MuiImageListItemBar-title': {
              overflow: 'visible',
            },
          },
        }}
        title={
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              height: (theme) => theme.spacing(5),
            }}
          >
            <Typography
              sx={{
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                display: '-webkit-box',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'initial',
                wordBreak: 'break-all',
              }}
              title={entry.name}
              variant="caption"
            >
              {entry.name}
            </Typography>
          </Box>
        }
      />
    </ImageListItem>
  )
}

export default DirectoryPreviewItem
