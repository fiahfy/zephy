import { Box, Typography } from '@mui/material'

import ExplorerTreeView from 'components/ExplorerTreeView'
import FavoriteTable from 'components/FavoriteTable'

const Navigator = () => (
  <Box sx={{ height: '100%', overflowY: 'auto' }}>
    <Box>
      <Typography
        paragraph
        sx={{
          background: (theme) => theme.palette.background.default,
          mb: 0,
          position: 'sticky',
          px: 1,
          top: 0,
          userSelect: 'none',
          zIndex: 1,
        }}
        variant="overline"
      >
        Favorites
      </Typography>
      <Box sx={{ pb: 1 }}>
        <FavoriteTable />
      </Box>
    </Box>
    <Box>
      <Typography
        paragraph
        sx={{
          background: (theme) => theme.palette.background.default,
          mb: 0,
          position: 'sticky',
          px: 1,
          top: 0,
          userSelect: 'none',
          zIndex: 1,
        }}
        variant="overline"
      >
        Explorer
      </Typography>
      <Box sx={{ pb: 1 }}>
        <ExplorerTreeView />
      </Box>
    </Box>
  </Box>
)

export default Navigator
