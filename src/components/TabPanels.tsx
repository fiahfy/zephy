import { Box } from '@mui/material'
import { useEffect } from 'react'
import TabPanel from '~/components/TabPanel'
import useWatcher from '~/hooks/useWatcher'
import { useAppDispatch, useAppSelector } from '~/store'
import { handle } from '~/store/explorer'
import { selectDirectoryPaths, selectTabs } from '~/store/window'

const TabPanels = () => {
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
        <TabPanel key={i} tabIndex={i} />
      ))}
    </Box>
  )
}

export default TabPanels
