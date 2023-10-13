import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import { handle } from '~/store/explorer'
import { selectCurrentDirectoryPath } from '~/store/window'

type EventType = 'create' | 'update' | 'delete'

export const WatcherContext = createContext<
  | {
      watch: (
        directoryPaths: string[],
        callback: (
          eventType: EventType,
          directoryPath: string,
          filePath: string,
        ) => void,
      ) => void
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const WatcherProvider = (props: Props) => {
  const { children } = props

  const currentDirectoryPath = useAppSelector(selectCurrentDirectoryPath)
  const dispatch = useAppDispatch()

  const [directoryPaths, setDirectoryPaths] = useState<string[]>([])
  const [callback, setCallback] =
    useState<
      () => (
        eventType: EventType,
        directoryPath: string,
        filePath: string,
      ) => void
    >()

  useEffect(() => {
    const uniqueDirectoryPaths = directoryPaths.includes(currentDirectoryPath)
      ? directoryPaths
      : [...directoryPaths, currentDirectoryPath]
    window.electronAPI.watcher.watch(
      uniqueDirectoryPaths,
      (eventType, directoryPath, filePath) => {
        // TODO: remove logging
        console.log(`[${new Date().toLocaleString()}]`, {
          currentDirectoryPath,
          directoryPaths,
          eventType,
          directoryPath,
          filePath,
        })
        callback?.()(eventType, directoryPath, filePath)
        dispatch(handle(eventType, directoryPath, filePath))
      },
    )
  }, [callback, currentDirectoryPath, directoryPaths, dispatch])

  const watch = useCallback(
    (
      directoryPaths: string[],
      callback: (
        eventType: EventType,
        directoryPath: string,
        filePath: string,
      ) => void,
    ) => {
      setDirectoryPaths(directoryPaths)
      setCallback(() => () => callback)
    },
    [],
  )

  const value = { watch }

  return (
    <WatcherContext.Provider value={value}>{children}</WatcherContext.Provider>
  )
}
