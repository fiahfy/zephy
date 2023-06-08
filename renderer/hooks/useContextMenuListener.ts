import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import { moveToTrash, newFolder, select, startEditing } from 'store/explorer'
import { add, remove } from 'store/favorite'
import {
  changeDirectory,
  goToSettings,
  setCurrentOrderBy,
  setCurrentViewMode,
  setSidebarHidden,
} from 'store/window'

const useContextMenuListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const removeListener = window.electronAPI.contextMenu.addListener(
      (message) => {
        const { type, data } = message
        switch (type) {
          case 'addToFavorites':
            return dispatch(add(data.path))
          case 'removeFromFavorites':
            return dispatch(remove(data.path))
          case 'newFolder':
            return dispatch(newFolder(data.path))
          case 'rename':
            dispatch(select(data.path))
            dispatch(startEditing(data.path))
            return
          case 'moveToTrash':
            return dispatch(moveToTrash(data.paths))
          case 'changeDirectory':
            return dispatch(changeDirectory(data.path))
          case 'goToSettings':
            return dispatch(goToSettings())
          case 'sort':
            return dispatch(setCurrentOrderBy(data.orderBy))
          case 'changeViewMode':
            return dispatch(setCurrentViewMode(data.viewMode))
          case 'changeSidebarHidden':
            return dispatch(setSidebarHidden(data.variant, data.hidden))
        }
      }
    )
    return () => removeListener()
  }, [dispatch])
}

export default useContextMenuListener
