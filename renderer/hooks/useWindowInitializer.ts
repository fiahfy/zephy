import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import { initialize } from 'store/window'

const useWindowInitializer = () => {
  const dispatch = useAppDispatch()

  const router = useRouter()

  const directory = router.query.directory

  useEffect(() => {
    if (typeof directory === 'string') {
      dispatch(initialize(directory))
    }
  }, [directory, dispatch])
}

export default useWindowInitializer
