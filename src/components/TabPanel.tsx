import { useEffect, useMemo } from 'react'
import Explorer from '~/components/Explorer'
import Settings from '~/components/Settings'
import { useAppDispatch, useAppSelector } from '~/store'
import { load } from '~/store/explorer'
import { selectDirectoryPathByTabIndex } from '~/store/window'

type Props = {
  tabIndex: number
}

const TabPanel = (props: Props) => {
  const { tabIndex } = props

  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabIndex(state, tabIndex),
  )
  const dispatch = useAppDispatch()

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

  return <Component tabIndex={tabIndex} />
}

export default TabPanel
