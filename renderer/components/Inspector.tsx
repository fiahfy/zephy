import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { useEffect } from 'react'
import { useAppSelector } from 'store'
import { selectSelectedContents } from 'store/window'

const Inspector = () => {
  const [content] = useAppSelector(selectSelectedContents)

  useEffect(() => {
    ;(async () => {
      if (!content) {
        return
      }
      const metadata = await window.electronAPI.ffmpeg.metadata(content.path)
      console.log(metadata)
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
