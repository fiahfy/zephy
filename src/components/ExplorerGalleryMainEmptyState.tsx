import { Box, Typography } from '@mui/material'

type Props = {
  message: string
}

const ExplorerGalleryMainEmptyState = (props: Props) => {
  const { message } = props

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <Typography variant="caption">{message}</Typography>
    </Box>
  )
}

export default ExplorerGalleryMainEmptyState
