import { Stack, Typography } from '@mui/material'

type Props = {
  message: string
}

const ExplorerGalleryMainEmptyState = (props: Props) => {
  const { message } = props

  return (
    <Stack
      sx={{
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <Typography variant="caption">{message}</Typography>
    </Stack>
  )
}

export default ExplorerGalleryMainEmptyState
