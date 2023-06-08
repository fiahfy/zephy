import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from 'store'
import { moveToTrash, selectSelected } from 'store/explorer'
import { goToSettings, setCurrentViewMode } from 'store/window'

const useApplicationMenuListener = () => {
  const selected = useAppSelector(selectSelected)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const removeListener = window.electronAPI.applicationMenu.addListener(
      (message) => {
        const { type, data } = message
        switch (type) {
          case 'moveToTrash':
            return dispatch(moveToTrash(selected))
          case 'goToSettings':
            return dispatch(goToSettings())
          case 'changeViewMode':
            return dispatch(setCurrentViewMode(data.viewMode))
        }
      }
    )
    return () => removeListener()
  }, [dispatch, selected])
}

export default useApplicationMenuListener
