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

  const content = useMemo(
    () => (contents.length === 1 ? contents[0] : undefined),
    [contents],
  )

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
        return <PreviewAudio entry={preview.content} />
      case 'directory':
        return <PreviewDirectory entry={preview.content} />
      case 'image':
        return <PreviewImage entry={preview.content} />
      case 'text':
        return <PreviewText entry={preview.content} />
      case 'video':
        return <PreviewVideo entry={preview.content} />
      default:
        return <PreviewEmptyState message="No preview" />
    }
  }, [preview])

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
            <PreviewInformationTable entries={contents} />
            {preview?.type === 'image' && (
              <PreviewParametersTable entry={preview.content} />
            )}
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
