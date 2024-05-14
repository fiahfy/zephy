import { Refresh as RefreshIcon } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import { ReactNode } from 'react'

type Props = {
  children?: ReactNode
  onClickRefresh?: () => void
  title: string
}

const Panel = (props: Props) => {
  const { children, onClickRefresh, title } = props

  return (
    <Box>
      <Typography
        paragraph
        sx={{
          alignItems: 'center',
          background: (theme) => theme.palette.background.default,
          display: 'flex',
          justifyContent: 'space-between',
          mb: 0,
          position: 'sticky',
          px: 1,
          top: 0,
          zIndex: 1,
          '&:hover': {
            '.MuiIconButton-root': {
              opacity: 1,
            },
          },
          '.MuiIconButton-root:focus-visible': {
            opacity: 1,
          },
        }}
        variant="overline"
      >
        <span>{title}</span>
        {onClickRefresh && (
          <IconButton
            onClick={onClickRefresh}
            size="small"
            sx={{ opacity: 0 }}
            title="Refresh"
          >
            <RefreshIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        )}
      </Typography>
      <Box sx={{ pb: 1 }}>{children}</Box>
    </Box>
  )
}

export default Panel
