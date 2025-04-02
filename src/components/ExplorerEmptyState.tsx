import { Stack, Typography } from '@mui/material'

type Props = {
  message: string
}

const ExplorerEmptyState = (props: Props) => {
  const { message } = props

  return (
    <Stack
      sx={{
        alignItems: 'center',
        height: '100%',
        inset: 0,
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
      }}
    >
      <Typography variant="caption">{message}</Typography>
    </Stack>
  )
}

export default ExplorerEmptyState
