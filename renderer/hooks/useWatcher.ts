import { useEffect } from 'react'
import { useAppSelector } from 'store'
import { selectCurrentDirectory } from 'store/window'

const useWatcher = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)

  useEffect(() => {
    window.electronAPI.watch(currentDirectory)
  }, [currentDirectory])
}

export default useWatcher
