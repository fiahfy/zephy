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
import useDragEntry from '~/hooks/useDragEntry'
import useDropEntry from '~/hooks/useDropEntry'
import useEntryItem from '~/hooks/useEntryItem'
import { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { openEntry, selectShouldShowHiddenFiles } from '~/store/settings'
import { changeDirectory } from '~/store/window'
import { isHiddenFile } from '~/utils/file'
import { rate, selectRating, selectScoreByPath } from '~/store/rating'

type State = {
  itemCount?: number
  status: 'error' | 'loaded' | 'loading'
  thumbnail?: string
}

type Action =
  | {
      type: 'error'
      payload: { itemCount: number; thumbnail?: string }
    }
  | {
      type: 'loaded'
      payload: { itemCount: number; thumbnail?: string }
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'error':
    case 'loaded':
      return {
        ...action.payload,
        status: action.type,
      }
    case 'loading':
      return { itemCount: undefined, status: action.type, thumbnail: undefined }
  }
}

type Props = {
  entry: Entry
}

const DirectoryPreviewItem = (props: Props) => {
  const { entry } = props

  const score = useAppSelector((state) =>
    selectScoreByPath(selectRating(state), entry.path),
  )
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const appDispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { draggable, ...dragHandlers } = useDragEntry(entry)
  const { droppableStyle, ...dropHandlers } = useDropEntry(entry)

  const [{ itemCount, status, thumbnail }, dispatch] = useReducer(reducer, {
    itemCount: undefined,
    status: 'loading',
    thumbnail: undefined,
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      const paths = await (async () => {
        if (entry.type !== 'directory') {
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
      const thumbnail = await (async () => {
        try {
          return await window.electronAPI.createEntryThumbnailUrl(paths)
        } catch (e) {
          return undefined
        }
      })()
      const success = await (async () => {
        if (!thumbnail) {
          return true
        }
        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(undefined)
            img.onerror = (e) => reject(e)
            img.src = thumbnail
          })
          return true
        } catch (e) {
          return false
        }
      })()
      if (unmounted) {
        return
      }
      dispatch({
        type: success ? 'loaded' : 'error',
        payload: { itemCount: paths.length, thumbnail },
      })
    })()

    return () => {
      unmounted = true
    }
  }, [entry.path, entry.type, entry.url, shouldShowHiddenFiles])

  const message = useMemo(() => {
    switch (status) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load'
      case 'loaded':
        return 'No preview'
    }
  }, [status])

  const handleDoubleClick = useCallback(
    async () =>
      entry.type === 'directory'
        ? appDispatch(changeDirectory(entry.path))
        : appDispatch(openEntry(entry.path)),
    [appDispatch, entry.path, entry.type],
  )

  const handleChangeScore = useCallback(
    (_e: SyntheticEvent, value: number | null) =>
      appDispatch(rate({ path: entry.path, score: value ?? 0 })),
    [appDispatch, entry.path],
  )

  // Rating component rendering is slow, so use useMemo to avoid unnecessary rendering
  const rating = useMemo(
    () => (
      <NoOutlineRating
        color="primary"
        onChange={handleChangeScore}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        precision={0.5}
        size="small"
        sx={{ my: 0.25 }}
        value={score}
      />
    ),
    [handleChangeScore, score],
  )

  return (
    <ImageListItem
      className="outlined"
      component="div"
      draggable={draggable}
      onContextMenu={onContextMenu}
      onDoubleClick={handleDoubleClick}
      sx={{
        borderRadius: (theme) => theme.spacing(0.5),
        cursor: 'pointer',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          inset: 0,
          pointerEvents: 'none',
          position: 'absolute',
        },
        '&:hover': {
          '&::before': {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        },
        ...droppableStyle,
      }}
      tabIndex={0}
      {...dragHandlers}
      {...dropHandlers}
    >
      {status === 'loaded' && thumbnail ? (
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
            {itemCount !== undefined && entry.type === 'directory' && (
              <Typography ml={1} noWrap variant="caption">
                {pluralize('item', itemCount, true)}
              </Typography>
            )}
          </Box>
        }
        sx={{
          '.MuiImageListItemBar-titleWrap': {
            minWidth: 0,
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
