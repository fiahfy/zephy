import { Box, Typography } from '@mui/material'
import { ReactNode } from 'react'

type Props = {
  children?: ReactNode
  title: string
}

const Panel = (props: Props) => {
  const { children, title } = props

  return (
    <Box>
      <Typography
        paragraph
        sx={{
          background: (theme) => theme.palette.background.default,
          mb: 0,
          position: 'sticky',
          px: 1,
          top: 0,
          zIndex: 1,
        }}
        variant="overline"
      >
        {title}
      </Typography>
      <Box sx={{ pb: 1 }}>{children}</Box>
    </Box>
  )
}

export default Panel
