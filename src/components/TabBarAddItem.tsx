import { Add as AddIcon } from '@mui/icons-material'
import { IconButton, Tab } from '@mui/material'
import { useCallback } from 'react'

// biome-ignore lint/complexity/noBannedTypes: <explanation>
type Props = {}

const TabBarAddItem = (props: Props) => {
  const { ...others } = props

  const handleClick = useCallback(() => window.electronAPI.openTab(), [])

  return (
    <Tab
      // @see https://github.com/mui/material-ui/issues/27947#issuecomment-905318861
      {...others}
      disableRipple
      icon={
        <IconButton
          component="span"
          onClick={handleClick}
          size="small"
          title="Close"
        >
          <AddIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      }
      // NOTE: Prevent tab change event
      onChange={undefined}
      sx={{
        minHeight: 0,
        minWidth: 0,
        px: 0.5,
        py: 0,
      }}
    />
  )
}

export default TabBarAddItem
