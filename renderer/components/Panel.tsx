import { Box, Typography } from '@mui/material'
import { ReactNode } from 'react'

type Props = {
  children?: ReactNode
  footer?: ReactNode
  title: string
}

const Panel = (props: Props) => {
  const { children, footer, title } = props

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
          userSelect: 'none',
          zIndex: 1,
        }}
        variant="overline"
      >
        {title}
      </Typography>
      <Box sx={{ pb: footer ? 0 : 1 }}>{children}</Box>
      {footer && (
        <Box
          sx={{
            background: (theme) => theme.palette.background.default,
            bottom: 0,
            position: 'sticky',
            zIndex: 1,
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  )
}

export default Panel
