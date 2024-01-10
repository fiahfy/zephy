import { Tabs } from '@mui/material'
import { SyntheticEvent, useCallback } from 'react'
import TabBarAddItem from '~/components/TabBarAddItem'
import TabBarItem from '~/components/TabBarItem'
import { useAppDispatch, useAppSelector } from '~/store'
import { changeTab, selectCurrentTabIndex, selectTabs } from '~/store/window'

const TabBar = () => {
  const tabIndex = useAppSelector(selectCurrentTabIndex)
  const tabs = useAppSelector(selectTabs)
  const dispatch = useAppDispatch()

  const handleChange = useCallback(
    (_e: SyntheticEvent, value: number) => dispatch(changeTab(value)),
    [dispatch],
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
            <TabBarItem key={i} tabIndex={i} />
          ))}
          <TabBarAddItem />
        </Tabs>
      )}
    </>
  )
}

export default TabBar
