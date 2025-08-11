import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import pluralize from 'pluralize'
import { useEffect, useMemo, useState } from 'react'
import type { Entry, Metadata } from '~/interfaces'
import {
  formatDateTime,
  formatDuration,
  formatFileSize,
} from '~/utils/formatter'

const getTotalFileSize = (entries: Entry[]) =>
  entries
    .filter((entry) => entry.type !== 'directory')
    .reduce((acc, entry) => acc + entry.size, 0)

const formatDateRange = (
  entries: Entry[],
  dateProperty: 'dateCreated' | 'dateLastOpened' | 'dateModified',
) => {
  const entry = entries[0]
  if (!entry) {
    return
  }
  if (entries.length > 1) {
    const dates = entries.map((entry) => entry[dateProperty])
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    return minDate === maxDate
      ? formatDateTime(minDate)
      : `${formatDateTime(minDate)} - ${formatDateTime(maxDate)}`
  }
  return formatDateTime(entry[dateProperty])
}

type Props = {
  entries: Entry[]
}

const PreviewInformationTable = (props: Props) => {
  const { entries } = props

  const [metadata, setMetadata] = useState<Metadata>()

  const entry = useMemo(() => entries[0], [entries])

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      if (entries.length > 1) {
        return
      }
      if (!entry.path) {
        return
      }
      const metadata = await (async () => {
        try {
          return await window.electronAPI.getEntryMetadata(entry.path)
        } catch (_e) {
          return undefined
        }
      })()
      if (unmounted) {
        return
      }
      setMetadata(metadata)
    })()

    return () => {
      unmounted = true
    }
  }, [entries.length, entry.path])

  const caption = useMemo(
    () =>
      entries.length > 1 ? pluralize('item', entries.length, true) : entry.name,
    [entries, entry],
  )

  const fileSize = useMemo(() => getTotalFileSize(entries), [entries])

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
        value: formatDateRange(entries, 'dateCreated'),
      },
      {
        label: 'Date Modified',
        value: formatDateRange(entries, 'dateModified'),
      },
      {
        label: 'Date Last Opened',
        value: formatDateRange(entries, 'dateLastOpened'),
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
    [entries, fileSize, metadata],
  )

  return (
    <Table size="small" sx={{ tableLayout: 'fixed' }}>
      <caption style={{ captionSide: 'top', padding: 0 }}>
        <Typography
          align="center"
          component="p"
          sx={{
            color: (theme) => theme.palette.text.primary,
            fontWeight: 'bold',
            overflowWrap: 'break-word',
            pb: 0.5,
            px: 1,
            userSelect: 'text',
          }}
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
