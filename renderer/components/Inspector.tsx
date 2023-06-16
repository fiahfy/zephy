import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { Metadata } from 'interfaces'
import { useEffect, useState } from 'react'
import { useAppSelector } from 'store'
import { selectSelectedContents } from 'store/window'
import { formatDate, formatTime } from 'utils/entry'

const Inspector = () => {
  const [content] = useAppSelector(selectSelectedContents)

  const [metadata, setMetadata] = useState<Metadata>()

  useEffect(() => {
    ;(async () => {
      if (!content || content.type === 'directory') {
        return setMetadata(undefined)
      }
      const metadata = await window.electronAPI.ffmpeg.metadata(content.path)
      setMetadata(metadata)
    })()
  }, [content])

  const rows = content
    ? [
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
    <Box
      sx={{
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <Table size="small" sx={{ width: '100%' }}>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell component="th" sx={{ height: 20, py: 0 }}>
                <Typography noWrap variant="caption">
                  {row.label}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ height: 20, py: 0 }}>
                <Typography noWrap variant="caption">
                  {row.value}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

export default Inspector
