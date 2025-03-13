import { Table, TableBody, TableCell, Typography } from '@mui/material'
import { useMemo } from 'react'
import FavoriteTableRow from '~/components/FavoriteTableRow'
import Icon from '~/components/Icon'
import Panel from '~/components/Panel'
import { useAppSelector } from '~/store'
import { selectFavorite, selectFavorites } from '~/store/favorite'

const FavoritePanel = () => {
  const favorites = useAppSelector((state) =>
    selectFavorites(selectFavorite(state)),
  )

  const items = useMemo(
    () => favorites.sort((a, b) => a.name.localeCompare(b.name)),
    [favorites],
  )

  return (
    <>
      {items.length > 0 && (
        <Panel title="Favorites">
          <Table size="small" sx={{ display: 'flex' }}>
            <TableBody sx={{ width: '100%' }}>
              {items.map((item) => (
                <FavoriteTableRow key={item.path} path={item.path}>
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
                    title={item.name}
                  >
                    <Icon type="folder" />
                    <Typography noWrap variant="caption">
                      {item.name}
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
