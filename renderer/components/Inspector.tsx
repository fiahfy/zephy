import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import fileUrl from 'file-url'
import { Metadata } from 'interfaces'
import { useEffect, useMemo, useReducer } from 'react'
import { useAppSelector } from 'store'
import { selectSelectedContents } from 'store/window'
import {
  formatDate,
  formatFileSize,
  formatTime,
  getMetadata,
  getThumbnail,
  isMediaFile,
} from 'utils/entry'

type State = { loading: boolean; metadata?: Metadata; thumbnail?: string }

type Action =
  | {
      type: 'loaded'
      payload: { metadata?: Metadata; thumbnail?: string }
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
      return { loading: true, metadata: undefined, thumbnail: undefined }
  }
}

const Inspector = () => {
  const [content] = useAppSelector(selectSelectedContents)

  const [{ loading, metadata, thumbnail }, dispatch] = useReducer(reducer, {
    loading: false,
    metadata: undefined,
    thumbnail: undefined,
  })

  useEffect(() => {
    ;(async () => {
      dispatch({ type: 'loading' })
      if (
        !content ||
        content.type === 'directory' ||
        !isMediaFile(content.path)
      ) {
        return dispatch({ type: 'loaded', payload: {} })
      }
      const [metadata, thumbnail] = await Promise.all([
        getMetadata(content.path),
        getThumbnail(content.path),
      ])
      dispatch({ type: 'loaded', payload: { metadata, thumbnail } })
    })()
  }, [content])

  const message = useMemo(
    () => (loading ? 'Loading...' : 'No Preview'),
    [loading]
  )

  const rows = content
    ? [
        {
          label: 'Size',
          value: content.type === 'file' && formatFileSize(content.size),
        },
        {
          label: 'Date Created',
          value: formatDate(content.dateCreated),
        },
        {
          label: 'Date Modified',
          value: formatDate(content.dateModified),
        },
        {
          label: 'Date Last Opened',
          value: formatDate(content.dateLastOpened),
        },
        ...(metadata
          ? [
              ...(metadata.height && metadata.width
                ? [
                    {
                      label: 'Dimensions',
                      value: `${metadata.width}x${metadata.height}`,
                    },
                  ]
                : []),
              ...(metadata.duration
                ? [
                    {
                      label: 'Duration',
                      value: formatTime(metadata.duration),
                    },
                  ]
                : []),
            ]
          : []),
      ]
    : []

  return (
    <Box
      sx={{
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      {!content && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          <Typography variant="caption">No Selected</Typography>
        </Box>
      )}
      {content && (
        <>
          <Typography
            paragraph
            sx={{
              background: (theme) => theme.palette.background.default,
              mb: 0,
              position: 'sticky',
              px: 1,
              top: 0,
              zIndex: 1,
            }}
            variant="overline"
          >
            Preview
          </Typography>
          <Box
            sx={{
              alignItems: 'center',
              aspectRatio: '1 / 1',
              display: 'flex',
              justifyContent: 'center',
              maxHeight: 128,
              userSelect: 'none',
              width: '100%',
            }}
          >
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl(thumbnail)} style={{ maxWidth: '100%' }} />
            ) : (
              <Typography variant="caption">{message}</Typography>
            )}
          </Box>
          <Box
            sx={{
              background: (theme) => theme.palette.background.default,
              position: 'sticky',
              bottom: 0,
              zIndex: 1,
            }}
          >
            <Typography
              align="center"
              fontWeight="bold"
              paragraph
              sx={{
                mb: 0,
                p: 1,
              }}
              variant="caption"
            >
              {content.name}
            </Typography>
            <Table size="small" sx={{ width: '100%' }}>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell
                      component="th"
                      sx={{ borderBottom: 0, height: 20, px: 1, py: 0 }}
                    >
                      <Typography noWrap variant="caption">
                        {row.label}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ borderBottom: 0, height: 20, px: 1, py: 0 }}
                    >
                      <Typography noWrap variant="caption">
                        {row.value}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  )
}

export default Inspector
