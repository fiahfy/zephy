import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useAppSelector } from 'store'
import { selectCurrentPathname } from 'store/window'

const useRedirect = () => {
  const currentPathname = useAppSelector(selectCurrentPathname)

  const router = useRouter()

  useEffect(() => {
    if (router.pathname !== currentPathname) {
      router.replace(currentPathname)
    }
  }, [currentPathname, router])
}

export default useRedirect
