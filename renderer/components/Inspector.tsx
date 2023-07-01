import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from '@mui/material'
import fileUrl from 'file-url'
import { ReactNode, useEffect, useReducer, useRef } from 'react'

import EntryInformationTable from 'components/EntryInformationTable'
import useContextMenu from 'hooks/useContextMenu'
import { Entry, Metadata } from 'interfaces'
import { useAppSelector } from 'store'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { selectSelectedContents } from 'store/window'
import {
  createThumbnailIfNeeded,
  createThumbnailsIfNeeded,
  createVideoThumbnails,
  getMetadata,
  isHiddenFile,
  isMediaFile,
  isVideoFile,
} from 'utils/file'
import { formatTime } from 'utils/formatter'

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

  const { createEntryMenuHandler } = useContextMenu()

  const [state, dispatch] = useReducer(reducer, { loading: true })
  const ref = useRef<HTMLDivElement>(null)

  const content = contents[0]

  useEffect(() => {
    if (!content) {
      return
    }
    if (ref.current) {
      ref.current.scrollTop = 0
    }

    let unmounted = false

    ;(async () => {
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
          const thumbnails = await createThumbnailsIfNeeded(paths)
          const newEntries = entries.reduce((carry, entry, i) => {
            const thumbnail = thumbnails[i]
            return thumbnail ? [...carry, { ...entry, thumbnail }] : carry
          }, [] as EntryWithThumbnail[])
          return { type: 'directory' as const, entries: newEntries }
        } else if (isVideoFile(content.path)) {
          const [metadata, thumbnails] = await Promise.all([
            getMetadata(content.path),
            createVideoThumbnails(content.path),
          ])
          return { type: 'video' as const, metadata, thumbnails }
        } else if (isMediaFile(content.path)) {
          const [metadata, thumbnail] = await Promise.all([
            getMetadata(content.path),
            createThumbnailIfNeeded(content.path),
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
      ref={ref}
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
                          onContextMenu={createEntryMenuHandler(entry)}
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
                          <ImageListItemBar
                            subtitle={entry.name}
                            sx={{
                              '.MuiImageListItemBar-titleWrap': {
                                p: 1,
                              },
                            }}
                          />
                          <Box
                            className="overlay"
                            sx={{
                              inset: 0,
                              pointerEvents: 'none',
                              position: 'absolute',
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
                              '.MuiImageListItemBar-titleWrap': {
                                p: 1,
                              },
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
