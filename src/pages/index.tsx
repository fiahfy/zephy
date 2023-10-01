import { useMemo } from 'react'
import Explorer from '~/components/Explorer'
import Settings from '~/components/Settings'
import { useAppSelector } from '~/store'
import { selectCurrentDirectory } from '~/store/window'

const IndexPage = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)

  const Component = useMemo(() => {
    switch (currentDirectory) {
      case 'zephy://settings':
        return Settings
      default:
        return Explorer
    }
  }, [currentDirectory])

  return <Component />
}

export default IndexPage
