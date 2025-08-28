import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { WatcherContext } from '~/contexts/WatcherContext'
import { useAppDispatch } from '~/store'
import { handleFileChange } from '~/store/window'

type Props = { children: ReactNode }

const WatcherProvider = (props: Props) => {
  const { children } = props

  const dispatch = useAppDispatch()

  const [registry, setRegistry] = useState<{
    [key: string]: {
      directoryPaths: string[]
    }
  }>({})

  const directoryPaths = useMemo(
    () => [
      ...new Set(
        Object.values(registry).flatMap(({ directoryPaths }) => directoryPaths),
      ),
    ],
    [registry],
  )

  const watch = useCallback(
    (key: string, directoryPaths: string[]) =>
      setRegistry((registry) => ({
        ...registry,
        [key]: {
          directoryPaths,
        },
      })),
    [],
  )

  const unwatch = useCallback(
    (key: string) =>
      setRegistry((registry) => {
        const { [key]: _, ...others } = registry
        return others
      }),
    [],
  )

  useEffect(() => {
    const removeListener = window.watcherAPI.onFileChange(
      (eventType, directoryPath, path) => {
        // TODO: Remove logging
        console.log(`[${new Date().toLocaleString()}]`, {
          eventType,
          directoryPath,
          path,
        })
        dispatch(handleFileChange(eventType, directoryPath, path))
      },
    )
    return () => removeListener()
  }, [dispatch])

  useEffect(() => {
    const unwatch = window.watcherAPI.watch(directoryPaths)
    return () => unwatch()
  }, [directoryPaths])

  const value = { unwatch, watch }

  return (
    <WatcherContext.Provider value={value}>{children}</WatcherContext.Provider>
  )
}

export default WatcherProvider
