import { Box, ImageListItem, ImageListItemBar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import fileUrl from 'file-url'
import { MouseEvent, useEffect, useMemo, useReducer } from 'react'
import EntryIcon from 'components/EntryIcon'
import NoOutlineRating from 'components/enhanced/NoOutlineRating'
import { Entry, ExplorerContent } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { selectIsFavorite } from 'store/favorite'
import { rate } from 'store/rating'
import { entryContextMenuProps } from 'utils/contextMenu'
import { isImageFile, isVideoFile } from 'utils/entry'

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

const getThumbnail = async (paths: string | string[]) => {
  const path = Array.isArray(paths)
    ? paths.filter((path) => isImageFile(path) || isVideoFile(path))[0]
    : paths
  if (!path) {
    return undefined
  }
  if (isVideoFile(path)) {
    return await window.electronAPI.ffmpeg.thumbnail(path)
  } else if (isImageFile(path)) {
    return path
  } else {
    return undefined
  }
}

type Props = {
  columnIndex: number
  content: ExplorerContent
  onClick: (e: MouseEvent<HTMLDivElement>) => void
  onDoubleClick: (e: MouseEvent<HTMLDivElement>) => void
  rowIndex: number
  selected: boolean
}

const ExplorerGridItem = (props: Props) => {
  const { columnIndex, content, onClick, onDoubleClick, rowIndex, selected } =
    props

  const favorite = useAppSelector(selectIsFavorite)(content.path)
  const appDispatch = useAppDispatch()

  const [{ loading, paths, thumbnail }, dispatch] = useReducer(reducer, {
    loading: false,
    paths: [],
    thumbnail: undefined,
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })

      if (content.type === 'file') {
        const thumbnail = await getThumbnail(content.path)
        return dispatch({
          type: 'loaded',
          payload: { paths: [content.path], thumbnail },
        })
      }

      let entries: Entry[] = []
      try {
        entries = await window.electronAPI.listEntries(content.path)
      } catch (e) {
        // noop
      }
      if (unmounted) {
        return
      }
      const paths = entries.map((entry) => entry.path)
      const thumbnail = await getThumbnail(paths)
      return dispatch({ type: 'loaded', payload: { paths, thumbnail } })
    })()

    return () => {
      unmounted = true
    }
  }, [content.path, content.type])

  const message = useMemo(
    () => (loading ? 'Loading...' : 'No Preview'),
    [loading]
  )

  return (
    <ImageListItem
      {...entryContextMenuProps(
        content.path,
        content.type === 'directory',
        favorite
      )}
      className={selected ? 'selected' : undefined}
      component="div"
      data-grid-column={columnIndex + 1}
      data-grid-row={rowIndex + 1}
      onClick={onClick}
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
                theme.palette.action.selectedOpacity
              ),
          },
          '&:hover': {
            '.overlay': {
              backgroundColor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity +
                    theme.palette.action.hoverOpacity
                ),
            },
          },
        },
      }}
      tabIndex={0}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
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
            userSelect: 'none',
          }}
        >
          <Typography variant="caption">{message}</Typography>
        </Box>
      )}
      <ImageListItemBar
        actionIcon={
          <Box mt={-3} mx={1}>
            <EntryIcon entry={content} size="small" />
          </Box>
        }
        actionPosition="left"
        subtitle={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              userSelect: 'none',
            }}
          >
            <NoOutlineRating
              color="primary"
              onChange={(_e, value) =>
                appDispatch(rate({ path: content.path, rating: value ?? 0 }))
              }
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
        sx={{ '.MuiImageListItemBar-titleWrap': { p: 0, pb: 1, pr: 1 } }}
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
              title={content.name}
              variant="caption"
            >
              {content.name}
            </Typography>
          </Box>
        }
      />
      <Box
        className="overlay"
        sx={{
          height: '100%',
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      />
    </ImageListItem>
  )
}

export default ExplorerGridItem
