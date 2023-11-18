import { Close as CloseIcon } from '@mui/icons-material'
import { IconButton, Tab, Tabs } from '@mui/material'

const TabBar = () => {
  return (
    <Tabs
      onChange={() => undefined}
      scrollButtons={false}
      sx={{
        flexShrink: 0,
        minHeight: 0,
        position: 'relative',
        '&::before': {
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          content: '""',
          inset: 'auto 0 0',
          position: 'absolute',
        },
        '.MuiTabs-indicator': {
          bottom: 'auto',
          top: 0,
        },
      }}
      value={1}
      variant="scrollable"
    >
      {Array(13)
        .fill(1)
        .map((_, i) => (
          <Tab
            disableRipple
            icon={
              <IconButton
                onClick={() => undefined}
                size="small"
                sx={{ opacity: 0 }}
                title="Close"
              >
                <CloseIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            }
            iconPosition="end"
            key={i}
            label="Downloads"
            sx={{
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              fontSize: '0.75rem',
              minHeight: 0,
              pl: 1.5,
              pr: 0.5,
              py: 0.5,
              textTransform: 'none',
              '&.Mui-selected': {
                backgroundColor: (theme) => theme.palette.background.default,
              },
              '&.Mui-selected, &:hover': {
                '.MuiIconButton-root': {
                  opacity: 1,
                },
              },
            }}
          />
        ))}
    </Tabs>
  )
}

export default TabBar
