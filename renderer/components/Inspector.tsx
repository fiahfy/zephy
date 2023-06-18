import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import fileUrl from 'file-url'
import { useEffect, useReducer } from 'react'
import { Entry, Metadata } from 'interfaces'
import { useAppSelector } from 'store'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { selectSelectedContents } from 'store/window'
import {
  formatDate,
  formatFileSize,
  formatTime,
  getMetadata,
  getThumbnail,
  getThumbnails,
  isHiddenFile,
  isMediaFile,
} from 'utils/entry'

type EntryWithThumbnail = Entry & { thumbnail: string }

type State = {
  entries: EntryWithThumbnail[]
  loading: boolean
  metadata?: Metadata
  thumbnail?: string
}

type Action =
  | {
      type: 'loaded'
      payload: {
        metadata?: Metadata
        thumbnail?: string
        entries?: EntryWithThumbnail[]
      }
    }
  | { type: 'loading' }

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        ...state,
        ...action.payload,
        loading: false,
      }
    case 'loading':
      return {
        entries: [],
        loading: true,
        metadata: undefined,
        thumbnail: undefined,
      }
  }
}

const ImageBox = styled(Box)(() => ({
  alignItems: 'center',
  aspectRatio: '1 / 1',
  display: 'flex',
  justifyContent: 'center',
  maxHeight: 128,
  userSelect: 'none',
  width: '100%',
}))

const Inspector = () => {
  const [content] = useAppSelector(selectSelectedContents)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const [{ loading, metadata, thumbnail, entries }, dispatch] = useReducer(
    reducer,
    {
      entries: [],
      loading: false,
      metadata: undefined,
      thumbnail: undefined,
    }
  )

  useEffect(() => {
    ;(async () => {
      dispatch({ type: 'loading' })
      if (!content) {
        return dispatch({ type: 'loaded', payload: {} })
      }
      if (content.type === 'directory') {
        let entries: Entry[] = []
        try {
          entries = await window.electronAPI.getEntries(content.path)
        } catch (e) {
          // noop
        }
        entries = entries.filter(
          (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name)
        )
        const paths = entries.map((entry) => entry.path)
        const thumbnails = await getThumbnails(paths)
        const newEntries = entries.reduce((carry, entry, i) => {
          const thumbnail = thumbnails[i]
          return thumbnail ? [...carry, { ...entry, thumbnail }] : carry
        }, [] as EntryWithThumbnail[])
        return dispatch({ type: 'loaded', payload: { entries: newEntries } })
      }
      if (!isMediaFile(content.path)) {
        return dispatch({ type: 'loaded', payload: {} })
      }

      const [metadata, thumbnail] = await Promise.all([
        getMetadata(content.path),
        getThumbnail(content.path),
      ])
      dispatch({ type: 'loaded', payload: { metadata, thumbnail } })
    })()
  }, [content, shouldShowHiddenFiles])

  const rows = content
    ? [
        ...(content.type === 'file'
          ? [
              {
                label: 'Size',
                value: formatFileSize(content.size),
              },
            ]
          : []),
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
          {loading && <ImageBox>Loading...</ImageBox>}
          {!loading && (
            <>
              {content.type === 'file' && (
                <ImageBox>
                  {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fileUrl(thumbnail)}
                      style={{ maxWidth: '100%' }}
                    />
                  ) : (
                    <Typography variant="caption">No Preview</Typography>
                  )}
                </ImageBox>
              )}
              {content.type === 'directory' && (
                <>
                  {entries.length === 0 && <ImageBox>No Preview</ImageBox>}
                  {entries.length > 0 &&
                    entries.map((entry) => (
                      <ImageBox key={entry.path}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fileUrl(entry.thumbnail)}
                          style={{ maxWidth: '100%' }}
                        />
                      </ImageBox>
                    ))}
                </>
              )}
            </>
          )}
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
