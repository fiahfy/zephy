import { Box } from '@mui/material'
import ExplorerPanel from '~/components/ExplorerPanel'
import FavoritePanel from '~/components/FavoritePanel'
import RatingPanel from '~/components/RatingPanel'

const Navigator = () => (
  <Box sx={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
    <FavoritePanel />
    <RatingPanel />
    <ExplorerPanel />
  </Box>
)

export default Navigator
