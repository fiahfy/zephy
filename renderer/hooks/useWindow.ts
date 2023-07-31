import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import { initialize } from 'store/window'

const useWindow = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    ;(async () => {
      const params = await window.electronAPI.windowState.getParams()
      const directory = params?.directory
      if (directory) {
        dispatch(initialize(directory))
      }
    })()
  }, [dispatch])
}

export default useWindow
