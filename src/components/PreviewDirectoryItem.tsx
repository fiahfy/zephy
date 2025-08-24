import {
  ImageListItem,
  ImageListItemBar,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import clsx from 'clsx'
import type { MouseEvent } from 'react'
import EntryIcon from '~/components/EntryIcon'
import useDraggable from '~/hooks/useDraggable'
import useDroppable from '~/hooks/useDroppable'
import useEntryItem from '~/hooks/useEntryItem'
import useEntryThumbnail from '~/hooks/useEntryThumbnail'
import usePreventClickOnDoubleClick from '~/hooks/usePreventClickOnDoubleClick'
import type { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  addSelection,
  focus,
  select,
  selectEditingByPath,
  selectFocusedByPath,
  selectSelectedByPath,
  startEditing,
  toggleSelection,
} from '~/store/preview'
import { open } from '~/store/settings'
import { changeUrl } from '~/store/window'

type Props = {
  content: Content
}

// TODO: Impl editing, DnD, copy/paste
const PreviewDirectoryItem = (props: Props) => {
  const { content } = props

  const editing = useAppSelector((state) =>
    selectEditingByPath(state, content.path),
  )
  const focused = useAppSelector((state) =>
    selectFocusedByPath(state, content.path),
  )
  const selected = useAppSelector((state) =>
    selectSelectedByPath(state, content.path),
  )
  const dispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(content)

  const { message, status, thumbnail } = useEntryThumbnail(content)

  const { draggable, ...dragHandlers } = useDraggable(content.path)
  const { droppableStyle, ...dropHandlers } = useDroppable(
    content.type === 'directory' ? content.path : undefined,
  )
  const { onClick, onDoubleClick } = usePreventClickOnDoubleClick(
    (e: MouseEvent) => {
      // NOTE: Prevent container event
      e.stopPropagation()
      if (e.shiftKey) {
        dispatch(addSelection(content.path))
      } else if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        dispatch(toggleSelection({ path: content.path }))
      } else {
        dispatch(select({ path: content.path }))
      }
      dispatch(focus({ path: content.path }))
    },
    () => {
      if (selected) {
        dispatch(startEditing({ path: content.path }))
      }
    },
    async (e: MouseEvent) => {
      // NOTE: Prevent container event
      e.stopPropagation()
      if (editing) {
        return
      }
      content.type === 'directory'
        ? dispatch(changeUrl(content.url))
        : dispatch(open(content.path))
    },
  )

  return (
    <ImageListItem
      className={clsx({ 'Mui-focused': focused, 'Mui-selected': selected })}
      component="div"
      draggable={draggable}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      sx={(theme) => ({
        borderRadius: theme.spacing(0.5),
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
        '.preview-list:focus-within &.Mui-focused': {
          outline: `${theme.palette.primary.main} solid 1px`,
          outlineOffset: '-1px',
        },
        ...droppableStyle,
      })}
      {...dragHandlers}
      {...dropHandlers}
    >
      {status === 'loaded' && thumbnail ? (
        <img
          alt=""
          src={thumbnail}
          style={{
            aspectRatio: '1 / 1',
            objectPosition: 'center top',
          }}
        />
      ) : (
        <Stack
          sx={{
            alignItems: 'center',
            aspectRatio: '1 / 1',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">{message}</Typography>
        </Stack>
      )}
      <ImageListItemBar
        actionIcon={
          <Stack>
            <EntryIcon entry={content} />
          </Stack>
        }
        actionPosition="left"
        sx={{
          gap: 0.5,
          px: 1,
          py: 0.5,
          '.MuiImageListItemBar-titleWrap': {
            p: 0,
          },
        }}
        title={
          <Stack>
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={content.name}
              variant="caption"
            >
              {content.name}
            </Typography>
          </Stack>
        }
      />
    </ImageListItem>
  )
}

export default PreviewDirectoryItem
