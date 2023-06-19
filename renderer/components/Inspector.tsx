import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import fileUrl from 'file-url'
import { useEffect, useReducer } from 'react'

import EntryInformationTable from 'components/EntryInformationTable'
import { Entry, Metadata } from 'interfaces'
import { useAppSelector } from 'store'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { selectSelectedContents } from 'store/window'
import {
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
          {loading && (
            <ImageBox>
              <Typography variant="caption">Loading...</Typography>
            </ImageBox>
          )}
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
                  {entries.length === 0 && (
                    <ImageBox>
                      <Typography variant="caption">No Preview</Typography>
                    </ImageBox>
                  )}
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
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              position: 'sticky',
              py: 1,
              userSelect: 'none',
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
              }}
              variant="caption"
            >
              {content.name}
            </Typography>
            <EntryInformationTable content={content} metadata={metadata} />
          </Box>
        </>
      )}
    </Box>
  )
}

export default Inspector
