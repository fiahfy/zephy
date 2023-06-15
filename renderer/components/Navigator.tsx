import { Box } from '@mui/material'
import ExplorerTreeView from 'components/ExplorerTreeView'
import FavoriteTreeView from 'components/FavoriteTreeView'

const Navigator = () => (
  <Box
    sx={{
      height: '100%',
      overflowY: 'auto',
    }}
  >
    <FavoriteTreeView />
    <ExplorerTreeView />
  </Box>
)

export default Navigator
