import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import clsx from 'clsx'
import fileUrl from 'file-url'
import { MouseEvent, useEffect, useMemo, useReducer } from 'react'

import NoOutlineRating from 'components/mui/NoOutlineRating'
import EntryIcon from 'components/EntryIcon'
import ExplorerNameTextField from 'components/ExplorerNameTextField'
import Outline from 'components/Outline'
import useDnd from 'hooks/useDnd'
import { Content, Entry } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import {
  selectIsEditing,
  selectIsSelected,
  selectSelectedContents,
} from 'store/explorer'
import { rate } from 'store/rating'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { createThumbnailIfNeeded, isHiddenFile } from 'utils/file'

type State = { loading: boolean; paths: string[]; thumbnail?: string }

type Action =
  | {
      type: 'loaded'
      payload: { paths: string[]; thumbnail?: string }
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
      return { loading: true, paths: [], thumbnail: undefined }
  }
}

type Props = {
  columnIndex: number
  content: Content
  focused: boolean
  onClick: (e: MouseEvent) => void
  onContextMenu: (e: MouseEvent) => void
  onDoubleClick: (e: MouseEvent) => void
  rowIndex: number
  selected: boolean
}

const ExplorerGridItem = (props: Props) => {
  const {
    columnIndex,
    content,
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    rowIndex,
    selected,
  } = props

  const isEditing = useAppSelector(selectIsEditing)
  const isSelected = useAppSelector(selectIsSelected)
  const selectedContents = useAppSelector(selectSelectedContents)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const appDispatch = useAppDispatch()

  const editing = isEditing(content.path)

  const { createDraggableProps, createDroppableProps, dropping } = useDnd()

  const [{ loading, paths, thumbnail }, dispatch] = useReducer(reducer, {
    loading: false,
    paths: [],
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

        let entries: Entry[] = []
        try {
          entries = await window.electronAPI.getEntries(content.path)
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
      dispatch({ type: 'loaded', payload: { paths, thumbnail } })
    })()

    return () => {
      unmounted = true
    }
  }, [content.path, content.type, shouldShowHiddenFiles])

  const message = useMemo(
    () => (loading ? 'Loading...' : 'No Preview'),
    [loading],
  )

  const draggingContents = useMemo(
    () =>
      editing
        ? undefined
        : isSelected(content.path)
        ? selectedContents
        : [content],
    [content, editing, isSelected, selectedContents],
  )

  return (
    <ImageListItem
      className={clsx({ focused, selected })}
      component="div"
      data-grid-column={columnIndex + 1}
      data-grid-row={rowIndex + 1}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      sx={{
        cursor: 'pointer',
        height: '100%!important',
        userSelect: 'none',
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
      {...createDraggableProps(draggingContents)}
      {...createDroppableProps(content)}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          loading="lazy"
          src={fileUrl(thumbnail)}
          style={{ objectPosition: 'center top' }}
        />
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
          <Box mt={-3} mx={1}>
            <EntryIcon entry={content} />
          </Box>
        }
        actionPosition="left"
        subtitle={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <NoOutlineRating
              color="primary"
              onChange={(_e, value) =>
                appDispatch(rate({ path: content.path, rating: value ?? 0 }))
              }
              onClick={(e) => e.stopPropagation()}
              precision={0.5}
              size="small"
              sx={{ my: 0.25 }}
              value={content.rating}
            />
            {!loading && content.type === 'directory' && (
              <Typography ml={1} noWrap variant="caption">
                {paths.length} items
              </Typography>
            )}
          </Box>
        }
        sx={{
          '.MuiImageListItemBar-titleWrap': {
            overflow: 'visible',
            p: 0,
            pb: 1,
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
