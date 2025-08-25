import { Box } from '@mui/material'
import { useEffect } from 'react'
import TabPanel from '~/components/TabPanel'
import useWatcher from '~/hooks/useWatcher'
import { useAppDispatch, useAppSelector } from '~/store'
import { handle } from '~/store/explorer-list'
import {
  selectCurrentTabId,
  selectDirectoryPaths,
  selectTabs,
} from '~/store/window'

const TabPanels = () => {
  const currentTabId = useAppSelector(selectCurrentTabId)
  const directoryPaths = useAppSelector(selectDirectoryPaths)
  const tabs = useAppSelector(selectTabs)
  const dispatch = useAppDispatch()

  const { unwatch, watch } = useWatcher()

  useEffect(() => {
    const key = 'explorer-list'
    watch(key, directoryPaths, (eventType, directoryPath, filePath) =>
      dispatch(handle(eventType, directoryPath, filePath)),
    )
    return () => unwatch(key)
  }, [directoryPaths, dispatch, unwatch, watch])

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {tabs.map((tab) => (
        <Box
          key={tab.id}
          sx={{
            display: tab.id === currentTabId ? 'block' : 'none',
            height: '100%',
            inset: 0,
            position: 'absolute',
            zIndex: tab.id === currentTabId ? 2 : 0,
          }}
        >
          <TabPanel tabId={tab.id} />
        </Box>
      ))}
      <Box
        sx={(theme) => ({
          height: '100%',
          inset: 0,
          position: 'absolute',
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
        })}
      />
    </Box>
  )
}

export default TabPanels
