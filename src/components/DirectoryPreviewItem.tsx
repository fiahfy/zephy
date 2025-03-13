import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import pluralize from 'pluralize'
import { useCallback } from 'react'
import EntryDragGhost from '~/components/EntryDragGhost'
import EntryIcon from '~/components/EntryIcon'
import Rating from '~/components/Rating'
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
  const { itemCount, message, status, thumbnail } = useEntryThumbnail(entry)
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
          <Box sx={{ ml: 1, mr: 0.5, mt: -2.5 }}>
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
            <Box sx={{ my: 0.25 }}>
              <Rating path={entry.path} />
            </Box>
            {itemCount !== undefined && entry.type === 'directory' && (
              <Typography noWrap sx={{ ml: 1 }} variant="caption">
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
