import { Add } from '@mui/icons-material'
import { Box, IconButton, Tabs } from '@mui/material'
import { SyntheticEvent, useCallback } from 'react'
import TabBarItem from '~/components/TabBarItem'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  changeTab,
  newTab,
  selectCurrentDirectoryPath,
  selectTabIndex,
  selectTabs,
} from '~/store/window'

const TabBar = () => {
  const currentDirectoryPath = useAppSelector(selectCurrentDirectoryPath)
  const tabIndex = useAppSelector(selectTabIndex)
  const tabs = useAppSelector(selectTabs)
  const dispatch = useAppDispatch()

  const handleChange = useCallback(
    (_e: SyntheticEvent, value: number) => dispatch(changeTab(value)),
    [dispatch],
  )

  const handleClick = useCallback(
    () => dispatch(newTab(currentDirectoryPath)),
    [currentDirectoryPath, dispatch],
  )

  return (
    <>
      {tabs.length > 1 && (
        <Tabs
          onChange={handleChange}
          scrollButtons="auto"
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
              transition: 'none',
            },
            '.MuiTabs-scrollButtons.Mui-disabled': {
              opacity: 0.3,
            },
          }}
          value={tabIndex}
          variant="scrollable"
        >
          {tabs.map((_, i) => (
            <TabBarItem index={i} key={i} />
          ))}
          <Box sx={{ alignItems: 'center', display: 'flex', px: 0.5 }}>
            <IconButton
              component="span"
              onClick={handleClick}
              size="small"
              title="Close"
            >
              <Add sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        </Tabs>
      )}
    </>
  )
}

export default TabBar
