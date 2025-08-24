import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import pluralize from 'pluralize'
import { useEffect, useMemo, useState } from 'react'
import type { Content, Metadata } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectCurrentSelectedContents } from '~/store/explorer-list'
import { selectPreviewContent } from '~/store/preview'
import {
  formatDateTime,
  formatDuration,
  formatFileSize,
} from '~/utils/formatter'

const getTotalFileSize = (contents: Content[]) =>
  contents
    .filter((content) => content.type !== 'directory')
    .reduce((acc, content) => acc + content.size, 0)

const formatDateRange = (
  contents: Content[],
  dateProperty: 'dateCreated' | 'dateLastOpened' | 'dateModified',
) => {
  const content = contents[0]
  if (!content) {
    return
  }
  if (contents.length > 1) {
    const dates = contents.map((content) => content[dateProperty])
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    return minDate === maxDate
      ? formatDateTime(minDate)
      : `${formatDateTime(minDate)} - ${formatDateTime(maxDate)}`
  }
  return formatDateTime(content[dateProperty])
}

const PreviewInformationTable = () => {
  const contents = useAppSelector(selectCurrentSelectedContents)
  const content = useAppSelector(selectPreviewContent)

  const [metadata, setMetadata] = useState<Metadata>()

  const caption = useMemo(
    () =>
      contents.length > 1
        ? pluralize('item', contents.length, true)
        : content?.name,
    [contents.length, content?.name],
  )

  const fileSize = useMemo(() => getTotalFileSize(contents), [contents])

  const rows = useMemo(
    () => [
      ...(fileSize
        ? [
            {
              label: 'Size',
              value: formatFileSize(fileSize),
            },
          ]
        : []),
      {
        label: 'Date Created',
        value: formatDateRange(contents, 'dateCreated'),
      },
      {
        label: 'Date Modified',
        value: formatDateRange(contents, 'dateModified'),
      },
      {
        label: 'Date Last Opened',
        value: formatDateRange(contents, 'dateLastOpened'),
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
                    value: formatDuration(metadata.duration),
                  },
                ]
              : []),
          ]
        : []),
    ],
    [contents, fileSize, metadata],
  )

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      if (contents.length > 1) {
        return
      }
      if (!content?.path) {
        return
      }
      const metadata = await window.electronAPI.getEntryMetadata(content.path)
      if (unmounted) {
        return
      }
      setMetadata(metadata)
    })()

    return () => {
      unmounted = true
    }
  }, [contents.length, content?.path])

  return (
    <Table size="small" sx={{ tableLayout: 'fixed' }}>
      <caption style={{ captionSide: 'top', padding: 0 }}>
        <Typography
          align="center"
          component="p"
          sx={(theme) => ({
            color: theme.palette.text.primary,
            fontWeight: 'bold',
            overflowWrap: 'break-word',
            pb: 0.5,
            px: 1,
            userSelect: 'text',
          })}
          variant="caption"
        >
          {caption}
        </Typography>
      </caption>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell
              component="th"
              sx={{
                borderBottom: 0,
                height: 20,
                px: 1,
                py: 0,
                width: 128,
              }}
            >
              <Typography noWrap sx={{ display: 'block' }} variant="caption">
                {row.label}
              </Typography>
            </TableCell>
            <TableCell
              align="right"
              sx={{ borderBottom: 0, height: 20, px: 1, py: 0 }}
            >
              <Typography noWrap sx={{ display: 'block' }} variant="caption">
                {row.value}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default PreviewInformationTable
