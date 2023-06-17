import { Box, Typography } from '@mui/material'
import ExplorerTreeView from 'components/ExplorerTreeView'
import FavoriteTable from 'components/FavoriteTable'

const Navigator = () => (
  <Box
    sx={{
      height: '100%',
      overflowY: 'auto',
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box>
        <Typography
          paragraph
          sx={{
            background: (theme) => theme.palette.background.default,
            mb: 0,
            position: 'sticky',
            px: 1,
            top: 0,
            zIndex: 1,
          }}
          variant="overline"
        >
          Favorites
        </Typography>
        <FavoriteTable />
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
            zIndex: 1,
          }}
          variant="overline"
        >
          Explorer
        </Typography>
        <ExplorerTreeView />
      </Box>
    </Box>
  </Box>
)

export default Navigator
