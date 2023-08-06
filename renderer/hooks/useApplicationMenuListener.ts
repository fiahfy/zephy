import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import { moveToTrash } from 'store/explorer'
import { goToSettings, setCurrentViewMode } from 'store/window'

const useApplicationMenuListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const removeListener = window.electronAPI.applicationMenu.addListener(
      (message) => {
        const { type, data } = message
        switch (type) {
          case 'moveToTrash':
            return dispatch(moveToTrash(data.paths))
          case 'goToSettings':
            return dispatch(goToSettings())
          case 'changeViewMode':
            return dispatch(setCurrentViewMode(data.viewMode))
        }
      },
    )
    return () => removeListener()
  }, [dispatch])
}

export default useApplicationMenuListener
