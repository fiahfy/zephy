import { Box } from '@mui/material'
import { useEffect, useMemo } from 'react'
import Explorer from '~/components/Explorer'
import Settings from '~/components/Settings'
import { useAppDispatch, useAppSelector } from '~/store'
import { load } from '~/store/explorer'
import { selectGetDirectoryPath, selectTabIndex } from '~/store/window'

type Props = {
  tabIndex: number
}

const TabPanel = (props: Props) => {
  const { tabIndex } = props

  const activeTabIndex = useAppSelector(selectTabIndex)
  const directoryPath = useAppSelector(selectGetDirectoryPath)(tabIndex)
  const dispatch = useAppDispatch()

  const active = useMemo(
    () => tabIndex === activeTabIndex,
    [activeTabIndex, tabIndex],
  )

  useEffect(() => {
    dispatch(load(tabIndex))
  }, [directoryPath, dispatch, tabIndex])

  const Component = useMemo(() => {
    switch (directoryPath) {
      case 'zephy://settings':
        return Settings
      default:
        return Explorer
    }
  }, [directoryPath])

  return (
    <Box
      sx={{
        height: '100%',
        inset: 0,
        position: 'absolute',
        visibility: active ? undefined : 'hidden',
      }}
    >
      <Component tabIndex={tabIndex} />
    </Box>
  )
}

export default TabPanel
