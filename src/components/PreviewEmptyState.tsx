import { Stack, Typography } from '@mui/material'
import type { ComponentProps } from 'react'

type Props = {
  message: string
  sx?: ComponentProps<typeof Stack>['sx']
}

const PreviewEmptyState = (props: Props) => {
  const { message, sx } = props

  return (
    <Stack
      sx={{
        alignItems: 'center',
        aspectRatio: '16 / 9',
        justifyContent: 'center',
        pointerEvents: 'none',
        minHeight: 128,
        ...sx,
      }}
    >
      <Typography variant="caption">{message}</Typography>
    </Stack>
  )
}

export default PreviewEmptyState
