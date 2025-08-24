import {
  ImageListItem,
  ImageListItemBar,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'
import EntryIcon from '~/components/EntryIcon'
import useDraggable from '~/hooks/useDraggable'
import useDroppable from '~/hooks/useDroppable'
import useEntryItem from '~/hooks/useEntryItem'
import useEntryThumbnail from '~/hooks/useEntryThumbnail'
import type { Content } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { openEntry } from '~/store/settings'
import { changeUrl } from '~/store/window'

type Props = {
  content: Content
}

const PreviewDirectoryItem = (props: Props) => {
  const { content } = props

  const dispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(content)
  const { message, status, thumbnail } = useEntryThumbnail(content)
  const { draggable, ...dragHandlers } = useDraggable(content.path)
  const { droppableStyle, ...dropHandlers } = useDroppable(
    content.type === 'directory' ? content.path : undefined,
  )

  const handleDoubleClick = useCallback(
    async () =>
      content.type === 'directory'
        ? dispatch(changeUrl(content.url))
        : dispatch(openEntry(content.path)),
    [dispatch, content.path, content.type, content.url],
  )

  return (
    <ImageListItem
      component="div"
      draggable={draggable}
      onContextMenu={onContextMenu}
      onDoubleClick={handleDoubleClick}
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
        ...droppableStyle,
      })}
      tabIndex={0}
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
