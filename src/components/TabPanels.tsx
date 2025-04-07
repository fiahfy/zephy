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

  const { watch } = useWatcher()

  useEffect(
    () =>
      watch(
        'explorer-list',
        directoryPaths,
        async (eventType, directoryPath, filePath) =>
          dispatch(handle(eventType, directoryPath, filePath)),
      ),
    [directoryPaths, dispatch, watch],
  )

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
            height: '100%',
            inset: 0,
            position: 'absolute',
            visibility: tab.id === currentTabId ? 'visible' : 'hidden',
            zIndex: tab.id === currentTabId ? 2 : 0,
          }}
        >
          <TabPanel tabId={tab.id} />
        </Box>
      ))}
      <Box
        sx={{
          height: '100%',
          inset: 0,
          position: 'absolute',
          zIndex: 1,
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      />
    </Box>
  )
}

export default TabPanels
