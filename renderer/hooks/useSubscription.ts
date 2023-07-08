import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import { moveToTrash, newFolder, select, startEditing } from 'store/explorer'
import { add, remove } from 'store/favorite'
import {
  changeDirectory,
  goToSettings,
  setCurrentOrderBy,
  setSidebarHidden,
  setViewMode,
} from 'store/window'

const useSubscription = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubscribe = window.electronAPI.subscribe((eventName, params) => {
      switch (eventName) {
        case 'changeDirectory':
          return dispatch(changeDirectory(params.path))
        case 'moveToTrash':
          return dispatch(moveToTrash(params.paths))
        case 'newFolder':
          return dispatch(newFolder(params.path))
        case 'addToFavorites':
          return dispatch(add(params.path))
        case 'removeFromFavorites':
          return dispatch(remove(params.path))
        case 'rename':
          dispatch(select(params.path))
          dispatch(startEditing(params.path))
          return
        case 'goToSettings':
          return dispatch(goToSettings())
        case 'sort':
          return dispatch(setCurrentOrderBy(params.orderBy))
        case 'changeViewMode':
          return dispatch(setViewMode(params.viewMode))
        case 'changeSidebarHidden':
          return dispatch(setSidebarHidden(params.variant, params.hidden))
      }
    })
    return () => unsubscribe()
  }, [dispatch])
}

export default useSubscription
