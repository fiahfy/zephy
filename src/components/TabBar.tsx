import { Tabs } from '@mui/material'
import { type SyntheticEvent, useCallback, useMemo } from 'react'
import TabBarAddItem from '~/components/TabBarAddItem'
import TabBarItem from '~/components/TabBarItem'
import { useAppDispatch, useAppSelector } from '~/store'
import { changeTab, selectCurrentTabId, selectTabs } from '~/store/window'

const TabBar = () => {
  const tabId = useAppSelector(selectCurrentTabId)
  const tabs = useAppSelector(selectTabs)
  const dispatch = useAppDispatch()

  const tabIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === tabId),
    [tabId, tabs],
  )

  const handleChange = useCallback(
    (_e: SyntheticEvent, value: number) => {
      const tab = tabs[value]
      if (tab) {
        dispatch(changeTab(tab.id))
      }
    },
    [dispatch, tabs],
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
          {tabs.map((tab) => (
            <TabBarItem key={tab.id} tabId={tab.id} />
          ))}
          <TabBarAddItem />
        </Tabs>
      )}
    </>
  )
}

export default TabBar
