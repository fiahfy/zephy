import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import clsx from 'clsx'
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
import ExplorerNameTextField from '~/components/ExplorerNameTextField'
import useDragEntry from '~/hooks/useDragEntry'
import useDropEntry from '~/hooks/useDropEntry'
import useExplorerItem from '~/hooks/useExplorerItem'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectSelectedContents } from '~/store/explorer'
import { rate } from '~/store/rating'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { isHiddenFile } from '~/utils/file'

type State = {
  itemCount?: number
  status: 'error' | 'loaded' | 'loading' | 'waiting'
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
  content: Content
}

const ExplorerGridItem = (props: Props) => {
  const { content } = props

  const selectedContents = useAppSelector(selectSelectedContents)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const appDispatch = useAppDispatch()

  const { editing, focused, onClick, onContextMenu, onDoubleClick, selected } =
    useExplorerItem(content)

  const dragContents = useMemo(
    () => (editing ? [] : selected ? selectedContents : [content]),
    [content, editing, selected, selectedContents],
  )

  const { draggable, ...dragHandlers } = useDragEntry(dragContents)
  const { droppableStyle, ...dropHandlers } = useDropEntry(content)

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
        if (content.type === 'file') {
          return [content.path]
        }

        try {
          const entries = await window.electronAPI.getEntries(content.path)
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
      let success = true
      if (thumbnail) {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(undefined)
            img.onerror = (e) => reject(e)
            img.src = thumbnail
          })
        } catch (e) {
          success = false
        }
      }
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
  }, [content.path, content.type, content.url, shouldShowHiddenFiles])

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

  const handleChangeRating = useCallback(
    (_e: SyntheticEvent, value: number | null) =>
      appDispatch(rate({ path: content.path, rating: value ?? 0 })),
    [appDispatch, content.path],
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
        value={content.rating}
      />
    ),
    [content.rating, handleChangeRating],
  )

  return (
    <ImageListItem
      className={clsx({ focused, selected })}
      component="div"
      draggable={draggable}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      sx={{
        cursor: 'pointer',
        height: '100%!important',
        width: '100%',
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
        '&.selected': {
          '::before': {
            backgroundColor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity,
              ),
          },
          '&:hover': {
            '::before': {
              backgroundColor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity +
                    theme.palette.action.hoverOpacity,
                ),
            },
          },
        },
        ...droppableStyle,
      }}
      {...dragHandlers}
      {...dropHandlers}
    >
      {status === 'loaded' && thumbnail ? (
        <img src={thumbnail} style={{ objectPosition: 'center top' }} />
      ) : (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">{message}</Typography>
        </Box>
      )}
      <ImageListItemBar
        actionIcon={
          <Box ml={1} mr={0.5} mt={-2.5}>
            <EntryIcon entry={content} />
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
            {itemCount !== undefined && content.type === 'directory' && (
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
            {editing ? (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexGrow: 1,
                  ml: -0.5,
                }}
              >
                <ExplorerNameTextField content={content} />
              </Box>
            ) : (
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
                title={content.name}
                variant="caption"
              >
                {content.name}
              </Typography>
            )}
          </Box>
        }
      />
    </ImageListItem>
  )
}

export default ExplorerGridItem
