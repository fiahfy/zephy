import { Box, Typography } from '@mui/material'

type Props = {
  message: string
}

const ExplorerEmptyState = (props: Props) => {
  const { message } = props

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        inset: 0,
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
      }}
    >
      <Typography variant="caption">{message}</Typography>
    </Box>
  )
}

export default ExplorerEmptyState
