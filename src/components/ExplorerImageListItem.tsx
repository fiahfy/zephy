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
import EntryIcon from '~/components/EntryIcon'
import ExplorerNameTextField from '~/components/ExplorerNameTextField'
import Rating from '~/components/Rating'
import useDraggable from '~/hooks/useDraggable'
import useDroppable from '~/hooks/useDroppable'
import useEntryThumbnail from '~/hooks/useEntryThumbnail'
import useExplorerItem from '~/hooks/useExplorerItem'
import type { Content } from '~/interfaces'

type Props = {
  content: Content
  tabId: number
}

const ExplorerImageListItem = (props: Props) => {
  const { content, tabId } = props

  const {
    draggingPaths,
    editing,
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    selected,
  } = useExplorerItem(tabId, content)

  const { itemCount, message, status, thumbnail } = useEntryThumbnail(content)

  const { draggable, ...dragHandlers } = useDraggable(draggingPaths)
  const { droppableStyle, ...dropHandlers } = useDroppable(
    content.type === 'directory' ? content.path : undefined,
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
        '.explorer-list:focus-within &.Mui-focused': {
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
            <ExplorerNameTextField
              content={content}
              multiline
              readOnly={!editing}
              tabId={tabId}
            />
          </Stack>
        }
      />
    </ImageListItem>
  )
}

export default ExplorerImageListItem
