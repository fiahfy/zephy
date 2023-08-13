import { useEffect, useState } from 'react'

import { useAppSelector } from 'store'
import { getTitle, selectCurrentDirectory } from 'store/window'

const useTitle = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)

  const [title, setTitle] = useState('')

  useEffect(() => {
    ;(async () => {
      const title = await getTitle(currentDirectory)
      setTitle(title)
    })()
  }, [currentDirectory])

  return title
}

export default useTitle
