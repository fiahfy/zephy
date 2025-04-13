import { useEffect, useMemo } from 'react'
import Explorer from '~/components/Explorer'
import Settings from '~/components/Settings'
import usePrevious from '~/hooks/usePrevious'
import { useAppDispatch, useAppSelector } from '~/store'
import { load } from '~/store/explorer-list'
import { selectDirectoryPathByTabId } from '~/store/window'

type Props = {
  tabId: number
}

const TabPanel = (props: Props) => {
  const { tabId } = props

  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabId(state, tabId),
  )
  const dispatch = useAppDispatch()

  const prevDirectoryPath = usePrevious(directoryPath)

  useEffect(() => {
    if (prevDirectoryPath !== directoryPath) {
      dispatch(load(tabId))
    }
  }, [directoryPath, dispatch, prevDirectoryPath, tabId])

  const Component = useMemo(() => {
    switch (directoryPath) {
      case 'zephy://settings':
        return Settings
      default:
        return Explorer
    }
  }, [directoryPath])

  return <Component tabId={tabId} />
}

export default TabPanel
