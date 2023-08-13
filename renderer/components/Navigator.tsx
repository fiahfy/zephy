import { Box } from '@mui/material'

import ExplorerTreeView from 'components/ExplorerTreeView'
import FavoriteTable from 'components/FavoriteTable'
import Panel from 'components/Panel'
import RatingTable from 'components/RatingTable'

const Navigator = () => (
  <Box sx={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
    <Panel title="Favorites">
      <FavoriteTable />
    </Panel>
    <Panel title="Ratings">
      <RatingTable />
    </Panel>
    <Panel title="Explorer">
      <ExplorerTreeView />
    </Panel>
  </Box>
)

export default Navigator
