import { Box } from '@mui/material'
import { useEffect } from 'react'
import TabPanel from '~/components/TabPanel'
import useWatcher from '~/hooks/useWatcher'
import { useAppDispatch, useAppSelector } from '~/store'
import { handle } from '~/store/explorer'
import {
  selectCurrentTabIndex,
  selectDirectoryPaths,
  selectTabs,
} from '~/store/window'

const TabPanels = () => {
  const currentTabIndex = useAppSelector(selectCurrentTabIndex)
  const directoryPaths = useAppSelector(selectDirectoryPaths)
  const tabs = useAppSelector(selectTabs)
  const dispatch = useAppDispatch()

  const { watch } = useWatcher()

  useEffect(
    () =>
      watch('tab', directoryPaths, async (eventType, directoryPath, filePath) =>
        dispatch(handle(eventType, directoryPath, filePath)),
      ),
    [directoryPaths, dispatch, watch],
  )

  return (
    <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
      {tabs.map((_, i) => (
        <Box
          key={i}
          sx={{
            height: '100%',
            inset: 0,
            position: 'absolute',
            zIndex: i === currentTabIndex ? 2 : 0,
          }}
        >
          <TabPanel tabIndex={i} />
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
