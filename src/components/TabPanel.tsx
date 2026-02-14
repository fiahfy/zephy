import { useEffect, useMemo } from 'react'
import Explorer from '~/components/Explorer'
import Settings from '~/components/Settings'
import { useAppDispatch, useAppSelector } from '~/store'
import { load } from '~/store/explorer-list'
import { selectUrlByTabId } from '~/store/window'

type Props = {
  tabId: number
}

const TabPanel = (props: Props) => {
  const { tabId } = props

  const url = useAppSelector((state) => selectUrlByTabId(state, tabId))
  const dispatch = useAppDispatch()

  const Component = useMemo(() => {
    switch (url) {
      case 'zephy://settings':
        return Settings
      default:
        return Explorer
    }
  }, [url])

  useEffect(() => {
    dispatch(load(tabId, url))
  }, [dispatch, tabId, url])

  return <Component tabId={tabId} />
}

export default TabPanel
