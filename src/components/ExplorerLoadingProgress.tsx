import { LinearProgress } from '@mui/material'

const ExplorerLoadingProgress = () => {
  return (
    <LinearProgress
      sx={{ inset: '0 0 auto', position: 'absolute', zIndex: 1 }}
    />
  )
}

export default ExplorerLoadingProgress
