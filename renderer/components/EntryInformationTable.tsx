import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'

import { Content, Metadata } from 'interfaces'
import { formatDate, formatFileSize, formatTime } from 'utils/entry'

const getTotalFileSize = (contents: Content[]) =>
  contents
    .filter((content) => content.type === 'file')
    .reduce((carry, content) => carry + content.size, 0)

const formatDateRange = (
  contents: Content[],
  dateProperty: 'dateCreated' | 'dateModified' | 'dateLastOpened'
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
      ? formatDate(minDate)
      : `${formatDate(minDate)} - ${formatDate(maxDate)}`
  } else {
    return formatDate(content[dateProperty])
  }
}

type Props = {
  contents: Content[]
  metadata?: Metadata
}
const EntryInformationTable = (props: Props) => {
  const { contents, metadata } = props

  const fileSize = getTotalFileSize(contents)

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
                  value: formatTime(metadata.duration),
                },
              ]
            : []),
        ]
      : []),
  ]

  return (
    <Table size="small" sx={{ userSelect: 'none' }}>
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
  )
}

export default EntryInformationTable
