import { Table, TableBody, TableCell, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import FavoriteTableRow from '~/components/FavoriteTableRow'
import Icon from '~/components/Icon'
import Panel from '~/components/Panel'
import useWatcher from '~/hooks/useWatcher'
import type { DetailedEntry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectFavorite, selectFavorites } from '~/store/favorite'

const FavoritePanel = () => {
  const favorites = useAppSelector((state) =>
    selectFavorites(selectFavorite(state)),
  )

  const { watch } = useWatcher()

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

  return (
    <>
      {entries.length > 0 && (
        <Panel title="Favorites">
          <Table size="small" sx={{ display: 'flex' }}>
            <TableBody sx={{ width: '100%' }}>
              {entries.map((entry) => (
                <FavoriteTableRow entry={entry} key={entry.path}>
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
                    <Icon type="folder" />
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
