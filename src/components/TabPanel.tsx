import { useEffect, useMemo } from 'react'
import Explorer from '~/components/Explorer'
import Settings from '~/components/Settings'
import { useAppDispatch, useAppSelector } from '~/store'
import { load } from '~/store/explorer'
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    dispatch(load(tabId))
  }, [directoryPath, dispatch, tabId])

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
