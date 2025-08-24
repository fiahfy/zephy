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
import { selectPreviewContent, selectPreviewContents } from '~/store/preview'
import { detectFileType } from '~/utils/file'

const PreviewPanel = () => {
  const contents = useAppSelector(selectPreviewContents)
  const content = useAppSelector(selectPreviewContent)

  const ref = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
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

  const preview = useMemo(() => {
    if (!content) {
      return undefined
    }
    const type =
      content.type === 'directory' ? 'directory' : detectFileType(content.path)
    return { type, content }
  }, [content])

  const needsExpand = useMemo(
    () => preview && ['text', 'directory'].includes(preview.type),
    [preview],
  )

  const previewItem = useMemo(() => {
    switch (preview?.type) {
      case 'audio':
        return <PreviewAudio />
      case 'directory':
        return <PreviewDirectory />
      case 'image':
        return <PreviewImage />
      case 'text':
        return <PreviewText />
      case 'video':
        return <PreviewVideo />
      default:
        return <PreviewEmptyState message="No preview" />
    }
  }, [preview])

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
        sx={(theme) => ({
          background: theme.palette.background.default,
          mb: 0,
          position: 'sticky',
          px: 1,
          top: 0,
          zIndex: 1,
        })}
        variant="overline"
      >
        Preview
      </Typography>
      {contents.length > 0 ? (
        <>
          <Stack
            sx={{
              flexShrink: needsExpand ? undefined : 0,
              minHeight: needsExpand ? 0 : undefined,
            }}
          >
            {previewItem}
          </Stack>
          <Box
            ref={footerRef}
            sx={(theme) => ({
              background: theme.palette.background.default,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              flexShrink: needsExpand ? 0 : undefined,
              gap: 1,
              minHeight: needsExpand ? undefined : 100,
              overflowX: 'hidden',
              overflowY: needsExpand ? undefined : 'auto',
              position: 'sticky',
              py: 1,
              zIndex: 1,
            })}
          >
            <PreviewInformationTable />
            {preview?.type === 'image' && <PreviewParametersTable />}
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
