import { Box, Typography } from '@mui/material'

type Props = {
  message: string
}

const EmptyPreview = (props: Props) => {
  const { message } = props

  return (
    <Box
      sx={{
        alignItems: 'center',
        aspectRatio: '16 / 9',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Typography variant="caption">{message}</Typography>
    </Box>
  )
}

export default EmptyPreview
