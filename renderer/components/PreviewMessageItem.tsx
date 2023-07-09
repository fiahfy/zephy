import { Box, ImageListItem, Typography } from '@mui/material'

type Props = {
  message: string
}

const PreviewMessageItem = (props: Props) => {
  const { message } = props

  return (
    <ImageListItem>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          height: 128,
        }}
      >
        <Typography variant="caption">{message}</Typography>
      </Box>
    </ImageListItem>
  )
}

export default PreviewMessageItem
