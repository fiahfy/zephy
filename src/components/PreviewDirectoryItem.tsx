import {
  Box,
  ImageListItem,
  ImageListItemBar,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import clsx from 'clsx'
import pluralize from 'pluralize'
import { type MouseEvent, useCallback, useMemo } from 'react'
import EntryIcon from '~/components/EntryIcon'
import EntryNameTextField from '~/components/EntryNameTextField'
import Rating from '~/components/ExplorerRating'
import useDraggable from '~/hooks/useDraggable'
import useDroppable from '~/hooks/useDroppable'
import useEntryThumbnail from '~/hooks/useEntryThumbnail'
import usePreventClickOnDoubleClick from '~/hooks/usePreventClickOnDoubleClick'
import type { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectFavorite, selectFavoriteByPath } from '~/store/favorite'
import {
  addSelection,
  finishEditing,
  focus,
  rename,
  select,
  selectDirectoryPath,
  selectEditingByPath,
  selectFocusedByPath,
  selectSelected,
  selectSelectedByPath,
  startEditing,
  toggleSelection,
} from '~/store/preview'
import { openUrl } from '~/store/settings'
import { changeUrl, newTab } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'

type Props = {
  content: Content
}

const PreviewDirectoryItem = (props: Props) => {
  const { content } = props

  const directoryPath = useAppSelector((state) => selectDirectoryPath(state))
  const editing = useAppSelector((state) =>
    selectEditingByPath(state, content.path),
  )
  const favorite = useAppSelector((state) =>
    selectFavoriteByPath(selectFavorite(state), content.path),
  )
  const focused = useAppSelector((state) =>
    selectFocusedByPath(state, content.path),
  )
  const selected = useAppSelector((state) =>
    selectSelectedByPath(state, content.path),
  )
  const selectedPaths = useAppSelector((state) => selectSelected(state))
  const dispatch = useAppDispatch()

  const { itemCount, message, status, thumbnail } = useEntryThumbnail(content)

  const draggingPaths = useMemo(
    () => (editing ? [] : selected ? selectedPaths : [content.path]),
    [content.path, editing, selected, selectedPaths],
  )

  const { draggable, ...dragHandlers } = useDraggable(draggingPaths)
  const { droppableStyle, ...dropHandlers } = useDroppable(
    content.type === 'directory' ? content.path : undefined,
  )

  const { onClick, onDoubleClick } = usePreventClickOnDoubleClick(
    (e: MouseEvent) => {
      // NOTE: Prevent container event
      e.stopPropagation()
      if (e.shiftKey) {
        dispatch(addSelection(content.path, false))
      } else if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        dispatch(toggleSelection({ path: content.path }))
      } else {
        dispatch(select({ path: content.path }))
      }
      dispatch(focus({ path: content.path }))
    },
    (e) => {
      if (!selected) {
        return
      }
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        // noop
      } else {
        dispatch(startEditing({ path: content.path }))
      }
    },
    async (e: MouseEvent) => {
      // NOTE: Prevent container event
      e.stopPropagation()
      if (editing) {
        return
      }
      if (content.type === 'directory') {
        if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
          dispatch(newTab(content.url))
        } else {
          dispatch(changeUrl(content.url))
        }
      } else {
        dispatch(openUrl(content.url))
      }
    },
  )

  const onContextMenu = useMemo(() => {
    const directory = content.type === 'directory'
    const url = content.url
    const path = content.path
    const paths = selectedPaths.includes(path) ? selectedPaths : [path]
    return createContextMenuHandler([
      ...(paths.length === 1
        ? [
            {
              type: 'open',
              data: { url },
            },
            ...(directory
              ? [
                  {
                    type: 'openInNewWindow',
                    data: { url },
                  },
                  {
                    type: 'openInNewTab',
                    data: { url },
                  },
                ]
              : []),
            {
              type: 'revealInExplorer',
              data: { path },
            },
            {
              type: 'revealInFinder',
              data: { path },
            },
            { type: 'separator' },
            {
              type: 'copyPath',
              data: { path },
            },
            { type: 'separator' },
            ...(directory
              ? [
                  {
                    type: 'toggleFavorite',
                    data: { path, favorite },
                  },
                ]
              : []),
            { type: 'separator' },
            {
              type: 'rename',
              data: { path },
            },
          ]
        : []),
      {
        type: 'moveToTrash',
        data: { paths },
      },
      { type: 'separator' },
      { type: 'cutEntries', data: { paths } },
      { type: 'copyEntries', data: { paths } },
      {
        type: 'pasteEntries',
        data: { path: directoryPath },
      },
    ])
  }, [
    content.path,
    content.type,
    content.url,
    directoryPath,
    favorite,
    selectedPaths,
  ])

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (editing) {
        e.preventDefault()
      }
    },
    [editing],
  )

  const handleFinish = useCallback(
    (changedValue: string | undefined) => {
      dispatch(finishEditing())
      if (changedValue) {
        dispatch(rename(content.path, changedValue))
      }
    },
    [content.path, dispatch],
  )

  return (
    <ImageListItem
      className={clsx({ 'Mui-focused': focused, 'Mui-selected': selected })}
      component="div"
      draggable={draggable}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
      sx={(theme) => ({
        borderRadius: theme.spacing(0.5),
        cursor: 'pointer',
        height: '100%!important',
        overflow: 'hidden',
        width: '100%',
        '&::before': {
          content: '""',
          inset: 0,
          pointerEvents: 'none',
          position: 'absolute',
        },
        '&:hover': {
          '&::before': {
            backgroundColor: theme.palette.action.hover,
          },
        },
        '&.Mui-selected': {
          '&::before': {
            backgroundColor: alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity,
            ),
          },
          '&:hover': {
            '&::before': {
              backgroundColor: alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity +
                  theme.palette.action.hoverOpacity,
              ),
            },
          },
        },
        '.preview:focus-within &.Mui-focused': {
          outline: `${theme.palette.primary.main} solid 1px`,
          outlineOffset: '-1px',
        },
        ...droppableStyle,
      })}
      {...dragHandlers}
      {...dropHandlers}
    >
      {status === 'loaded' && thumbnail ? (
        <img alt="" src={thumbnail} style={{ objectPosition: 'center top' }} />
      ) : (
        <Stack
          sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">{message}</Typography>
        </Stack>
      )}
      <ImageListItemBar
        actionIcon={
          <Stack sx={{ mt: -2.75 }}>
            <EntryIcon entry={content} />
          </Stack>
        }
        actionPosition="left"
        subtitle={
          <Stack
            direction="row"
            sx={{
              alignItems: 'end',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ my: 0.25 }}>
              <Rating path={content.path} />
            </Box>
            {itemCount !== undefined && content.type === 'directory' && (
              <Typography noWrap sx={{ ml: 1 }} variant="caption">
                {pluralize('item', itemCount, true)}
              </Typography>
            )}
          </Stack>
        }
        sx={{
          gap: 0.5,
          px: 1,
          py: 0.5,
          '.MuiImageListItemBar-titleWrap': {
            overflow: 'visible',
            p: 0,
            '.MuiImageListItemBar-title': {
              overflow: 'visible',
            },
          },
        }}
        title={
          <Stack
            direction="row"
            sx={(theme) => ({
              alignItems: 'center',
              height: theme.spacing(5),
            })}
          >
            <EntryNameTextField
              entry={content}
              multiline
              onFinish={handleFinish}
              readOnly={!editing}
            />
          </Stack>
        }
      />
    </ImageListItem>
  )
}

export default PreviewDirectoryItem
