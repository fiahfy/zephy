import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import {
  copy,
  moveToTrash,
  newFolder,
  newWindow,
  paste,
  select,
  selectAll,
  startEditing,
} from 'store/explorer'
import { add, remove } from 'store/favorite'
import {
  changeDirectory,
  go,
  goToSettings,
  setCurrentOrderBy,
  setCurrentViewMode,
  setSidebarHidden,
} from 'store/window'

const useMessageListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const removeListener = window.electronAPI.message.addListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'addToFavorites':
          return dispatch(add(data.path))
        case 'changeDirectory':
          return dispatch(changeDirectory(data.path))
        case 'changeSidebarHidden':
          return dispatch(setSidebarHidden(data.variant, data.hidden))
        case 'changeViewMode':
          return dispatch(setCurrentViewMode(data.viewMode))
        case 'copy':
          return dispatch(copy())
        case 'go':
          return dispatch(go(data.offset))
        case 'goToSettings':
          return dispatch(goToSettings())
        case 'moveToTrash':
          return dispatch(moveToTrash(data?.paths))
        case 'newWindow':
          return dispatch(newWindow(data?.path))
        case 'newFolder':
          return dispatch(newFolder(data.path))
        case 'removeFromFavorites':
          return dispatch(remove(data.path))
        case 'rename':
          dispatch(select(data.path))
          dispatch(startEditing(data.path))
          return
        case 'paste':
          return dispatch(paste())
        case 'selectAll':
          return dispatch(selectAll())
        case 'sort':
          return dispatch(setCurrentOrderBy(data.orderBy))
      }
    })
    return () => removeListener()
  }, [dispatch])
}

export default useMessageListener
