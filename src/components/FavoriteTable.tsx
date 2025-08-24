import { Table, TableBody, TableCell, Typography } from '@mui/material'
import FavoriteTableRow from '~/components/FavoriteTableRow'
import Icon from '~/components/Icon'

type Props = {
  favorites: {
    name: string
    path: string
  }[]
}

const FavoriteTable = (props: Props) => {
  const { favorites } = props

  return (
    <Table size="small" sx={{ display: 'flex' }}>
      <TableBody sx={{ width: '100%' }}>
        {favorites.map((favorite) => (
          <FavoriteTableRow key={favorite.path} path={favorite.path}>
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
              title={favorite.name}
            >
              <Icon type="folder" />
              <Typography noWrap variant="caption">
                {favorite.name}
              </Typography>
            </TableCell>
          </FavoriteTableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default FavoriteTable
