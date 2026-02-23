import { Box } from '@mui/material'
import { createElement, useEffect, useMemo } from 'react'
import ExplorerGallery from '~/components/ExplorerGallery'
import ExplorerImageList from '~/components/ExplorerImageList'
import ExplorerTable from '~/components/ExplorerTable'
import useDroppable from '~/hooks/useDroppable'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectDirectoryPathByTabId,
  selectUrlByTabId,
  selectViewModeByTabIdAndUrl,
  setScrollPosition,
} from '~/store/window'

type Props = {
  tabId: number
}

const Explorer = (props: Props) => {
  const { tabId } = props

  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabId(state, tabId),
  )
  const url = useAppSelector((state) => selectUrlByTabId(state, tabId))
  const viewMode = useAppSelector((state) =>
    selectViewModeByTabIdAndUrl(state, tabId, url),
  )

  const dispatch = useAppDispatch()

  const { droppableStyle, ...dropHandlers } = useDroppable(directoryPath)

  const Component = useMemo(() => {
    switch (viewMode) {
      case 'gallery':
        return ExplorerGallery
      case 'thumbnail':
        return ExplorerImageList
      default:
        return ExplorerTable
    }
  }, [viewMode])

  // NOTE: 初回起動時にスクロール位置を戻す
  useEffect(() => {
    dispatch(setScrollPosition(tabId, 0))
  }, [dispatch, tabId])

  return (
    <Box sx={{ height: '100%', ...droppableStyle }} {...dropHandlers}>
      {createElement(Component, {
        tabId,
      })}
    </Box>
  )
}

export default Explorer
