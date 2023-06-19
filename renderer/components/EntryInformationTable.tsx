import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'

import { Content, Metadata } from 'interfaces'
import { formatDate, formatFileSize, formatTime } from 'utils/entry'

type Props = {
  content: Content
  metadata?: Metadata
}
const EntryInformationTable = (props: Props) => {
  const { content, metadata } = props

  const rows = content
    ? [
        ...(content.type === 'file'
          ? [
              {
                label: 'Size',
                value: formatFileSize(content.size),
              },
            ]
          : []),
        {
          label: 'Date Created',
          value: formatDate(content.dateCreated),
        },
        {
          label: 'Date Modified',
          value: formatDate(content.dateModified),
        },
        {
          label: 'Date Last Opened',
          value: formatDate(content.dateLastOpened),
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
    : []

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
