import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { type Callback, WatcherContext } from '~/contexts/WatcherContext'

type Props = { children: ReactNode }

const WatcherProvider = (props: Props) => {
  const { children } = props

  const [registry, setRegistry] = useState<{
    [key: string]: {
      directoryPaths: string[]
      callback: Callback
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

  useEffect(() => {
    window.electronAPI.watchDirectories(
      directoryPaths,
      (eventType, directoryPath, filePath) => {
        // TODO: remove logging
        console.log(`[${new Date().toLocaleString()}]`, {
          directoryPaths,
          eventType,
          directoryPath,
          filePath,
        })
        for (const { callback } of Object.values(registry)) {
          callback(eventType, directoryPath, filePath)
        }
      },
    )
  }, [directoryPaths, registry])

  const watch = useCallback(
    (key: string, directoryPaths: string[], callback: Callback) =>
      setRegistry((registry) => ({
        ...registry,
        [key]: {
          directoryPaths,
          callback,
        },
      })),
    [],
  )

  const value = { watch }

  return (
    <WatcherContext.Provider value={value}>{children}</WatcherContext.Provider>
  )
}

export default WatcherProvider
