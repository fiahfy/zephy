import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import { handle } from '~/store/explorer'
import { selectCurrentDirectoryPaths } from '~/store/window'

type EventType = 'create' | 'update' | 'delete'

type Callback = (
  eventType: EventType,
  directoryPath: string,
  filePath: string,
) => void

export const WatcherContext = createContext<
  | {
      watch: (directoryPaths: string[], callback: Callback) => void
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const WatcherProvider = (props: Props) => {
  const { children } = props

  const currentDirectoryPaths = useAppSelector(selectCurrentDirectoryPaths)
  const dispatch = useAppDispatch()

  const [directoryPaths, setDirectoryPaths] = useState<string[]>([])
  const [callback, setCallback] = useState<() => Callback>()

  const uniqueDirectoryPaths = useMemo(
    () => [...new Set([...directoryPaths, ...currentDirectoryPaths])],
    [currentDirectoryPaths, directoryPaths],
  )

  useEffect(() => {
    window.electronAPI.watchDirectories(
      uniqueDirectoryPaths,
      (eventType, directoryPath, filePath) => {
        // TODO: remove logging
        console.log(`[${new Date().toLocaleString()}]`, {
          uniqueDirectoryPaths,
          eventType,
          directoryPath,
          filePath,
        })
        callback?.()(eventType, directoryPath, filePath)
        dispatch(handle(eventType, directoryPath, filePath))
      },
    )
  }, [callback, dispatch, uniqueDirectoryPaths])

  const watch = useCallback((directoryPaths: string[], callback: Callback) => {
    setDirectoryPaths(directoryPaths)
    setCallback(() => () => callback)
  }, [])

  const value = { watch }

  return (
    <WatcherContext.Provider value={value}>{children}</WatcherContext.Provider>
  )
}
