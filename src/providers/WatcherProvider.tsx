import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { WatcherContext } from '~/contexts/WatcherContext'
import type { FileEventHandler } from '~/interfaces'

type Props = { children: ReactNode }

const WatcherProvider = (props: Props) => {
  const { children } = props

  const [registry, setRegistry] = useState<{
    [key: string]: {
      directoryPaths: string[]
      handler: FileEventHandler
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

  const handlers = useMemo(
    () => [
      ...new Set(Object.values(registry).flatMap(({ handler }) => handler)),
    ],
    [registry],
  )

  const watch = useCallback(
    (key: string, directoryPaths: string[], handler: FileEventHandler) =>
      setRegistry((registry) => ({
        ...registry,
        [key]: {
          directoryPaths,
          handler,
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
        for (const handler of handlers) {
          handler(eventType, directoryPath, path)
        }
      },
    )
    return () => removeListener()
  }, [handlers])

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
