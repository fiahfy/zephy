import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import { useCallback } from 'react'
import EntryDragGhost from '~/components/EntryDragGhost'
import EntryIcon from '~/components/EntryIcon'
import useDraggable from '~/hooks/useDraggable'
import useDroppable from '~/hooks/useDroppable'
import useEntryItem from '~/hooks/useEntryItem'
import useEntryThumbnail from '~/hooks/useEntryThumbnail'
import type { Entry } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { openEntry } from '~/store/settings'
import { changeDirectory } from '~/store/window'

type Props = {
  entry: Entry
}

const DirectoryPreviewItem = (props: Props) => {
  const { entry } = props

  const dispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { message, status, thumbnail } = useEntryThumbnail(entry)
  const { draggable, ...dragHandlers } = useDraggable(
    entry.path,
    <EntryDragGhost entries={[entry]} />,
  )
  const { droppableStyle, ...dropHandlers } = useDroppable(
    entry.type === 'directory' ? entry.path : undefined,
  )

  const handleDoubleClick = useCallback(
    async () =>
      entry.type === 'directory'
        ? dispatch(changeDirectory(entry.path))
        : dispatch(openEntry(entry.path)),
    [dispatch, entry.path, entry.type],
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
          <Box sx={{ display: 'flex' }}>
            <EntryIcon entry={entry} />
          </Box>
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
          <Box
            sx={{
              display: 'flex',
            }}
          >
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
