import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { Metadata } from 'interfaces'
import { useEffect, useState } from 'react'
import { useAppSelector } from 'store'
import { selectSelectedContents } from 'store/window'

const formatTime = (sec: number) => {
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = Math.round(sec % 60)

  const hh = hours > 0 ? String(hours).padStart(2, '0') : ''
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  let result = ''

  if (hh) {
    result += `${hh}:`
  }

  result += `${mm}:${ss}`

  return result
}

const Inspector = () => {
  const [content] = useAppSelector(selectSelectedContents)

  const [metadata, setMetadata] = useState<Metadata>()

  useEffect(() => {
    ;(async () => {
      if (!content || content.type === 'directory') {
        return setMetadata(undefined)
      }
      const metadata = await window.electronAPI.ffmpeg.metadata(content.path)
      console.log(metadata)
      setMetadata(metadata)
    })()
  }, [content])

  const rows = content
    ? [
        {
          label: 'Date Created',
          value: format(content.dateCreated, 'PP HH:mm'),
        },
        {
          label: 'Date Modified',
          value: format(content.dateModified, 'PP HH:mm'),
        },
        {
          label: 'Date Last Opened',
          value: format(content.dateLastOpened, 'PP HH:mm'),
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
              <TableCell component="th">
                <Typography noWrap variant="caption">
                  {row.label}
                </Typography>
              </TableCell>
              <TableCell align="right">
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
