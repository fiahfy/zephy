import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from 'store'
import { addEntry, removeEntry } from 'store/explorer'
import { selectCurrentDirectory } from 'store/window'

const useWatcher = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)

  const dispatch = useAppDispatch()

  useEffect(() => {
    window.electronAPI.watchDirectory(currentDirectory, (eventType, path) => {
      switch (eventType) {
        case 'create':
          return dispatch(addEntry(path))
        case 'delete':
          return dispatch(removeEntry(path))
      }
    })
  }, [currentDirectory, dispatch])
}

export default useWatcher
