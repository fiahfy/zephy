import { Table, TableBody, TableCell, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import FavoriteTableRow from '~/components/FavoriteTableRow'
import Icon from '~/components/Icon'
import Panel from '~/components/Panel'
import useWatcher from '~/hooks/useWatcher'
import { DetailedEntry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectFavorite, selectFavorites } from '~/store/favorite'

const FavoritePanel = () => {
  const favorites = useAppSelector((state) =>
    selectFavorites(selectFavorite(state)),
  )

  const { watch } = useWatcher()

  const [selected, setSelected] = useState<string[]>([])
  const [entries, setEntries] = useState<DetailedEntry[]>([])

  const load = useCallback(async () => {
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
  }, [favorites])

  useEffect(() => {
    load()
  }, [load])

  useEffect(
    () =>
      watch('favorite', [], async (_eventType, _directoryPath, filePath) => {
        const paths = entries.map((entry) => entry.path)
        if (paths.includes(filePath)) {
          load()
        }
      }),
    [entries, load, watch],
  )

  const handleBlur = useCallback(() => setSelected([]), [])

  const handleFocus = useCallback((path: string) => setSelected([path]), [])

  return (
    <>
      {entries.length > 0 && (
        <Panel title="Favorites">
          <Table size="small" sx={{ display: 'flex' }}>
            <TableBody sx={{ width: '100%' }}>
              {entries.map((entry) => (
                <FavoriteTableRow
                  entry={entry}
                  key={entry.path}
                  onBlur={() => handleBlur()}
                  onFocus={() => handleFocus(entry.path)}
                  selected={selected.includes(entry.path)}
                >
                  <TableCell
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
        </Panel>
      )}
    </>
  )
}

export default FavoritePanel
