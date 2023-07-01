import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from 'store'
import { createEntry, deleteEntry, selectCurrentDirectory } from 'store/window'

const useWatcher = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)

  const dispatch = useAppDispatch()

  useEffect(() => {
    window.electronAPI.watchDirectory(currentDirectory, (eventType, path) => {
      switch (eventType) {
        case 'create':
          return dispatch(createEntry(path))
        case 'delete':
          return dispatch(deleteEntry(path))
      }
    })
  }, [currentDirectory, dispatch])
}

export default useWatcher
