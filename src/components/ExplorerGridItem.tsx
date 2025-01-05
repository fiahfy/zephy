import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import clsx from 'clsx'
import pluralize from 'pluralize'
import { useRef } from 'react'
import EntryIcon from '~/components/EntryIcon'
import ExplorerNameTextField from '~/components/ExplorerNameTextField'
import Rating from '~/components/Rating'
import useDragEntry from '~/hooks/useDragEntry'
import useDropEntry from '~/hooks/useDropEntry'
import useExplorerItem from '~/hooks/useExplorerItem'
import useThumbnailEntry from '~/hooks/useThumbnailEntry'
import type { Content } from '~/interfaces'

type Props = {
  content: Content
  tabId: number
}

const ExplorerGridItem = (props: Props) => {
  const { content, tabId } = props

  const ref = useRef<HTMLDivElement>(null)

  const {
    draggingContents,
    editing,
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    onKeyDown,
    selected,
  } = useExplorerItem(tabId, content, ref)

  const { itemCount, message, status, thumbnail } = useThumbnailEntry(content)

  const { draggable, ...dragHandlers } = useDragEntry(draggingContents)
  const { droppableStyle, ...dropHandlers } = useDropEntry(content)

  return (
    <ImageListItem
      className={clsx({ focused, selected })}
      component="div"
      draggable={draggable}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      ref={ref}
      sx={{
        borderRadius: (theme) => theme.spacing(0.5),
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
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        },
        '&.selected': {
          '&::before': {
            backgroundColor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity,
              ),
          },
          '&:hover': {
            '&::before': {
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
      tabIndex={0}
      {...dragHandlers}
      {...dropHandlers}
    >
      {status === 'loaded' && thumbnail ? (
        <img alt="" src={thumbnail} style={{ objectPosition: 'center top' }} />
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
          <Box sx={{ ml: 1, mr: 0.5, mt: -2.5 }}>
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
            <Box sx={{ my: 0.25 }}>
              <Rating path={content.path} />
            </Box>
            {itemCount !== undefined && content.type === 'directory' && (
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
            {editing ? (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexGrow: 1,
                  ml: -0.5,
                }}
              >
                <ExplorerNameTextField content={content} tabId={tabId} />
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
