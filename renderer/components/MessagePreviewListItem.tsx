import { Box, ImageListItem, Typography } from '@mui/material'

type Props = {
  message: string
}

const MessagePreviewListItem = (props: Props) => {
  const { message } = props

  return (
    <ImageListItem>
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
    </ImageListItem>
  )
}

export default MessagePreviewListItem
