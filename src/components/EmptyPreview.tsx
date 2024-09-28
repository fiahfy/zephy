import { Box, Typography } from '@mui/material'
import type { ComponentProps } from 'react'

type Props = {
  message: string
  sx?: ComponentProps<typeof Box>['sx']
}

const EmptyPreview = (props: Props) => {
  const { message, sx } = props

  return (
    <Box
      sx={{
        alignItems: 'center',
        aspectRatio: '16 / 9',
        display: 'flex',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <Typography variant="caption">{message}</Typography>
    </Box>
  )
}

export default EmptyPreview
