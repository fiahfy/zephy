import { Tabs } from '@mui/material'
import { SyntheticEvent, useCallback } from 'react'
import TabBarItem from '~/components/TabBarItem'
import { useAppDispatch, useAppSelector } from '~/store'
import { changeTab, selectTabIndex, selectTabs } from '~/store/window'

const TabBar = () => {
  const tabIndex = useAppSelector(selectTabIndex)
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
              transition: 'none',
            },
          }}
          value={tabIndex}
          variant="scrollable"
        >
          {tabs.map((_, i) => (
            <TabBarItem index={i} key={i} />
          ))}
        </Tabs>
      )}
    </>
  )
}

export default TabBar
