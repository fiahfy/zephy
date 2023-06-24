import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from '@mui/material'
import fileUrl from 'file-url'
import { ReactNode, useEffect, useReducer } from 'react'

import EntryInformationTable from 'components/EntryInformationTable'
import { Entry, Metadata } from 'interfaces'
import { useAppSelector } from 'store'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { selectSelectedContents } from 'store/window'
import {
  formatTime,
  getMetadata,
  getThumbnail,
  getThumbnails,
  getVideoThumbnails,
  isHiddenFile,
  isMediaFile,
  isVideoFile,
} from 'utils/entry'
import { useContextMenu } from 'hooks/useContextMenu'

type EntryWithThumbnail = Entry & { thumbnail: string }

type State =
  | {
      loading: true
    }
  | {
      loading: false
      type: 'directory'
      entries: EntryWithThumbnail[]
    }
  | {
      loading: false
      type: 'video'
      metadata?: Metadata
      thumbnails: string[]
    }
  | {
      loading: false
      type: 'other'
      metadata?: Metadata
      thumbnail?: string
    }

type Action =
  | {
      type: 'loaded'
      payload:
        | {
            type: 'directory'
            entries: EntryWithThumbnail[]
          }
        | {
            type: 'video'
            metadata?: Metadata
            thumbnails: string[]
          }
        | {
            type: 'other'
            metadata?: Metadata
            thumbnail?: string
          }
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        ...action.payload,
        loading: false as const,
      }
    case 'loading':
      return { loading: true as const }
  }
}

const MessageBox = (props: { children: ReactNode }) => {
  const { children } = props
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        height: 128,
      }}
    >
      <Typography variant="caption">{children}</Typography>
    </Box>
  )
}

const Inspector = () => {
  const contents = useAppSelector(selectSelectedContents)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const { openEntry } = useContextMenu()

  const [state, dispatch] = useReducer(reducer, { loading: true })

  const content = contents[0]

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      if (!content) {
        return
      }
      dispatch({ type: 'loading' })
      const payload = await (async () => {
        if (contents.length > 1) {
          return { type: 'other' as const }
        } else if (content.type === 'directory') {
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
          return { type: 'directory' as const, entries: newEntries }
        } else if (isVideoFile(content.path)) {
          const [metadata, thumbnails] = await Promise.all([
            getMetadata(content.path),
            getVideoThumbnails(content.path),
          ])
          return { type: 'video' as const, metadata, thumbnails }
        } else if (isMediaFile(content.path)) {
          const [metadata, thumbnail] = await Promise.all([
            getMetadata(content.path),
            getThumbnail(content.path),
          ])
          return { type: 'other' as const, metadata, thumbnail }
        } else {
          return { type: 'other' as const }
        }
      })()
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload })
    })()

    return () => {
      unmounted = true
    }
  }, [content, contents.length, shouldShowHiddenFiles])

  const handleDoubleClick = async (entry: Entry) =>
    await window.electronAPI.openPath(entry.path)

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
              userSelect: 'none',
              zIndex: 1,
            }}
            variant="overline"
          >
            Preview
          </Typography>
          <ImageList cols={1} gap={1} sx={{ my: 0, userSelect: 'none' }}>
            {state.loading && (
              <ImageListItem>
                <MessageBox>Loading...</MessageBox>
              </ImageListItem>
            )}
            {!state.loading && (
              <>
                {state.type === 'directory' && (
                  <>
                    {state.entries.length > 0 ? (
                      state.entries.map((entry) => (
                        <ImageListItem
                          key={entry.path}
                          onContextMenu={openEntry(entry.path, false)}
                          onDoubleClick={() => handleDoubleClick(entry)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              '.overlay': {
                                backgroundColor: (theme) =>
                                  theme.palette.action.hover,
                              },
                            },
                          }}
                          tabIndex={0}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            loading="lazy"
                            src={fileUrl(entry.thumbnail)}
                            style={{
                              aspectRatio: '16 / 9',
                              objectFit: 'contain',
                            }}
                          />
                          <ImageListItemBar subtitle={entry.name} />
                          <Box
                            className="overlay"
                            sx={{
                              height: '100%',
                              left: 0,
                              pointerEvents: 'none',
                              position: 'absolute',
                              top: 0,
                              width: '100%',
                            }}
                          />
                        </ImageListItem>
                      ))
                    ) : (
                      <ImageListItem>
                        <MessageBox>No Preview</MessageBox>
                      </ImageListItem>
                    )}
                  </>
                )}
                {state.type === 'video' && (
                  <>
                    {state.thumbnails.length > 0 ? (
                      state.thumbnails.map((thumbnail, i) => (
                        <ImageListItem key={thumbnail}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            loading="lazy"
                            src={fileUrl(thumbnail)}
                            style={{
                              aspectRatio: '16 / 9',
                              objectFit: 'contain',
                            }}
                          />
                          <ImageListItemBar
                            subtitle={formatTime(
                              ((state.metadata?.duration ?? 0) / 10) * (i + 1)
                            )}
                            sx={{
                              '.MuiImageListItemBar-subtitle': {
                                textAlign: 'center',
                              },
                            }}
                          />
                        </ImageListItem>
                      ))
                    ) : (
                      <ImageListItem>
                        <MessageBox>No Preview</MessageBox>
                      </ImageListItem>
                    )}
                  </>
                )}
                {state.type === 'other' && (
                  <>
                    {state.thumbnail ? (
                      <ImageListItem>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          loading="lazy"
                          src={fileUrl(state.thumbnail)}
                          style={{ minHeight: 128 }}
                        />
                      </ImageListItem>
                    ) : (
                      <ImageListItem>
                        <MessageBox>No Preview</MessageBox>
                      </ImageListItem>
                    )}
                  </>
                )}
              </>
            )}
          </ImageList>
          <Box
            sx={{
              background: (theme) => theme.palette.background.default,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              position: 'sticky',
              py: 1,
              zIndex: 1,
            }}
          >
            <Typography
              align="center"
              fontWeight="bold"
              paragraph
              sx={{
                mb: 0,
                px: 1,
                userSelect: 'none',
              }}
              variant="caption"
            >
              {contents.length > 1 ? `${contents.length} items` : content.name}
            </Typography>
            {!state.loading && (
              <EntryInformationTable
                contents={contents}
                metadata={
                  state.type === 'directory' ? undefined : state.metadata
                }
              />
            )}
          </Box>
        </>
      )}
    </Box>
  )
}

export default Inspector
