import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import { handle } from '~/store/explorer'
import { selectCurrentDirectory } from '~/store/window'

type EventType = 'create' | 'update' | 'delete'

export const WatcherContext = createContext<
  | {
      watch: (
        paths: string[],
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

  const currentDirectory = useAppSelector(selectCurrentDirectory)
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
    const paths = directoryPaths.includes(currentDirectory)
      ? directoryPaths
      : [...directoryPaths, currentDirectory]
    window.electronAPI.watcher.watch(
      paths,
      (eventType, directoryPath, filePath) => {
        // TODO: remove logging
        console.log(`[${new Date().toLocaleString()}]`, {
          currentDirectory,
          directoryPaths,
          eventType,
          directoryPath,
          filePath,
        })
        callback?.()(eventType, directoryPath, filePath)
        dispatch(handle(eventType, directoryPath, filePath))
      },
    )
  }, [callback, currentDirectory, directoryPaths, dispatch])

  const watch = useCallback(
    (
      paths: string[],
      callback: (
        eventType: EventType,
        directoryPath: string,
        filePath: string,
      ) => void,
    ) => {
      setDirectoryPaths(paths)
      setCallback(() => () => callback)
    },
    [],
  )

  const value = { watch }

  return (
    <WatcherContext.Provider value={value}>{children}</WatcherContext.Provider>
  )
}