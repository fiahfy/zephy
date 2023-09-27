import { Table, TableBody, TableCell, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import FavoriteTableRow from '~/components/FavoriteTableRow'
import Icon from '~/components/Icon'
import { DetailedEntry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectFavorites } from '~/store/favorite'

const FavoriteTable = () => {
  const favorites = useAppSelector(selectFavorites)

  const [selected, setSelected] = useState<string[]>([])
  const [entries, setEntries] = useState<DetailedEntry[]>([])

  useEffect(() => {
    ;(async () => {
      const entries = await (async () => {
        try {
          const entries = await window.electronAPI.getDetailedEntriesForPaths(
            favorites.map((favorite) => favorite.path),
          )
          return entries.sort((a, b) => a.name.localeCompare(b.name))
        } catch (e) {
          return []
        }
      })()
      setEntries(entries)
    })()
  }, [favorites])

  const handleBlur = useCallback(() => setSelected([]), [])

  const handleFocus = useCallback((path: string) => setSelected([path]), [])

  return (
    <Table
      component="div"
      size="small"
      sx={{ display: 'flex', userSelect: 'none' }}
    >
      <TableBody component="div" sx={{ width: '100%' }}>
        {entries.map((entry) => (
          <FavoriteTableRow
            entry={entry}
            key={entry.path}
            onBlur={() => handleBlur()}
            onFocus={() => handleFocus(entry.path)}
            selected={selected.includes(entry.path)}
          >
            <TableCell
              component="div"
              sx={{
                alignItems: 'center',
                borderBottom: 'none',
                display: 'flex',
                height: 20,
                gap: 0.5,
                px: 1,
                py: 0,
                width: '100%',
              }}
              title={entry.name}
            >
              <Icon iconType="folder" />
              <Typography noWrap variant="caption">
                {entry.name}
              </Typography>
            </TableCell>
          </FavoriteTableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default FavoriteTable
