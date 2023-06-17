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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 1 }}>
      <FavoriteTreeView />
      <ExplorerTreeView />
    </Box>
  </Box>
)

export default Navigator
