import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

import Icon from 'components/Icon'
import useContextMenu from 'hooks/useContextMenu'
import { useAppDispatch, useAppSelector } from 'store'
import { selectFavorites } from 'store/favorite'
import { changeDirectory } from 'store/window'
import { DetailedEntry } from 'interfaces'

const FavoriteTable = () => {
  const favorites = useAppSelector(selectFavorites)
  const dispatch = useAppDispatch()

  const { createEntryMenuHandler } = useContextMenu()

  const [selected, setSelected] = useState<string[]>([])
  const [entries, setEntries] = useState<DetailedEntry[]>([])

  useEffect(() => {
    ;(async () => {
      let entries = await window.electronAPI.getDetailedEntriesForPaths(
        favorites
      )
      entries = entries.sort((a, b) => a.name.localeCompare(b.name))
      setEntries(entries)
    })()
  }, [favorites])

  const handleBlur = () => setSelected([])

  const handleClick = (path: string) => dispatch(changeDirectory(path))

  const handleFocus = (path: string) => setSelected([path])

  return (
    <Table size="small" sx={{ display: 'flex', userSelect: 'none' }}>
      <TableBody sx={{ width: '100%' }}>
        {entries.map((entry) => (
          <TableRow
            hover
            key={entry.path}
            onBlur={() => handleBlur()}
            onClick={() => handleClick(entry.path)}
            onContextMenu={createEntryMenuHandler(entry)}
            onFocus={() => handleFocus(entry.path)}
            selected={selected.includes(entry.path)}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              width: '100%',
              '&:focus-visible': {
                outline: '-webkit-focus-ring-color auto 1px',
              },
            }}
            tabIndex={0}
            title={entry.name}
          >
            <TableCell
              sx={{
                alignItems: 'center',
                borderBottom: 'none',
                display: 'flex',
                height: 20,
                gap: 1,
                px: 1,
                py: 0,
                width: '100%',
              }}
            >
              <Icon iconType="folder" />
              <Typography noWrap variant="caption">
                {entry.name}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default FavoriteTable
