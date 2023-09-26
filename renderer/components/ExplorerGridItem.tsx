import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import clsx from 'clsx'
import pluralize from 'pluralize'
import {
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import NoOutlineRating from '~/components/mui/NoOutlineRating'
import EntryIcon from '~/components/EntryIcon'
import ExplorerNameTextField from '~/components/ExplorerNameTextField'
import Outline from '~/components/Outline'
import useDnd from '~/hooks/useDnd'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectIsEditing,
  selectIsSelected,
  selectSelectedContents,
} from '~/store/explorer'
import { rate } from '~/store/rating'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { isHiddenFile } from '~/utils/file'

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
  'aria-colindex': number
  'aria-rowindex': number
  content: Content
  focused: boolean
  onClick: (e: MouseEvent) => void
  onContextMenu: (e: MouseEvent) => void
  onDoubleClick: (e: MouseEvent) => void
  selected: boolean
}

const ExplorerGridItem = (props: Props) => {
  const { content, focused, onClick, onContextMenu, onDoubleClick, selected } =
    props

  const isEditing = useAppSelector(selectIsEditing)
  const isSelected = useAppSelector(selectIsSelected)
  const selectedContents = useAppSelector(selectSelectedContents)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const appDispatch = useAppDispatch()

  const { createDraggableBinder, createDroppableBinder, dropping } = useDnd()

  const [{ itemCount, loading, thumbnail }, dispatch] = useReducer(reducer, {
    itemCount: 0,
    loading: false,
    thumbnail: undefined,
  })

  const editing = useMemo(
    () => isEditing(content.path),
    [content.path, isEditing],
  )

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
      const thumbnail = await window.electronAPI.createThumbnailUrl(paths)
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
  }, [content.path, content.type, content.url, shouldShowHiddenFiles])

  const message = useMemo(
    () => (loading ? 'Loading...' : 'No preview'),
    [loading],
  )

  const dragContents = useMemo(
    () =>
      editing
        ? undefined
        : isSelected(content.path)
        ? selectedContents
        : [content],
    [content, editing, isSelected, selectedContents],
  )

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
      aria-colindex={props['aria-colindex']}
      aria-rowindex={props['aria-rowindex']}
      className={clsx({ focused, selected })}
      component="div"
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      sx={{
        cursor: 'pointer',
        height: '100%!important',
        width: '100%',
        '&:hover': {
          '.overlay': {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        },
        '&.selected': {
          '.overlay': {
            backgroundColor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity,
              ),
          },
          '&:hover': {
            '.overlay': {
              backgroundColor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity +
                    theme.palette.action.hoverOpacity,
                ),
            },
          },
        },
      }}
      {...createDraggableBinder(dragContents)}
      {...createDroppableBinder(content)}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
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
            {!loading && content.type === 'directory' && (
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

export default ExplorerGridItem
