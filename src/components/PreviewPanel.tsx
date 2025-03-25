import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useRef } from 'react'
import PreviewAudio from '~/components/PreviewAudio'
import PreviewDirectory from '~/components/PreviewDirectory'
import PreviewEmptyState from '~/components/PreviewEmptyState'
import PreviewImage from '~/components/PreviewImage'
import PreviewInformationTable from '~/components/PreviewInformationTable'
import PreviewParametersTable from '~/components/PreviewParametersTable'
import PreviewText from '~/components/PreviewText'
import PreviewVideo from '~/components/PreviewVideo'
import { useAppSelector } from '~/store'
import { selectCurrentSelectedContents } from '~/store/explorer-list'
import { detectFileType } from '~/utils/file'

const PreviewPanel = () => {
  const contents = useAppSelector(selectCurrentSelectedContents)

  const ref = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const el = ref.current
    if (el) {
      el.scrollTop = 0
    }
    const footerEl = footerRef.current
    if (footerEl) {
      footerEl.scrollTop = 0
    }
  }, [contents])

  const content = useMemo(() => contents[0], [contents])

  const type = useMemo(
    () =>
      content
        ? content.type === 'directory'
          ? 'directory'
          : detectFileType(content.path)
        : 'none',
    [content],
  )

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <Typography
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
      {contents.length > 0 ? (
        <>
          {contents.length === 1 && content ? (
            <>
              {type === 'audio' && <PreviewAudio entry={content} />}
              {type === 'directory' && <PreviewDirectory entry={content} />}
              {type === 'image' && <PreviewImage entry={content} />}
              {type === 'text' && <PreviewText entry={content} />}
              {type === 'video' && <PreviewVideo entry={content} />}
              {!['audio', 'directory', 'image', 'text', 'video'].includes(
                type,
              ) && <PreviewEmptyState message="No preview" />}
            </>
          ) : (
            <PreviewEmptyState message="No preview" />
          )}
          <Box
            ref={footerRef}
            sx={{
              background: (theme) => theme.palette.background.default,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflowX: 'hidden',
              overflowY: type === 'image' ? 'auto' : undefined,
              position: 'sticky',
              py: 1,
              zIndex: 1,
            }}
          >
            <PreviewInformationTable entries={contents} />
            {type === 'image' && <PreviewParametersTable entry={content} />}
          </Box>
        </>
      ) : (
        <Stack
          sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">No selected</Typography>
        </Stack>
      )}
    </Box>
  )
}

export default PreviewPanel
