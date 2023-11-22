import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { DetailedEntry, Metadata } from '~/interfaces'
import {
  formatDateTime,
  formatDuration,
  formatFileSize,
} from '~/utils/formatter'

const getTotalFileSize = (entries: DetailedEntry[]) =>
  entries
    .filter((entry) => entry.type === 'file')
    .reduce((acc, entry) => acc + entry.size, 0)

const formatDateRange = (
  entries: DetailedEntry[],
  dateProperty: 'dateCreated' | 'dateModified' | 'dateLastOpened',
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
  } else {
    return formatDateTime(entry[dateProperty])
  }
}

type Props = {
  entries: DetailedEntry[]
  metadata?: Metadata
}

const EntryInformationTable = (props: Props) => {
  const { entries, metadata } = props

  const fileSize = getTotalFileSize(entries)

  const rows = [
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
  ]

  return (
    <Table size="small" sx={{ tableLayout: 'fixed' }}>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell
              component="th"
              sx={{ borderBottom: 0, height: 20, px: 1, py: 0 }}
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

export default EntryInformationTable
