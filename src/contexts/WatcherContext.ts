import { createContext } from 'react'

export const WatcherContext = createContext<
  | {
      unwatch: (key: string) => void
      watch: (key: string, directoryPaths: string[]) => void
    }
  | undefined
>(undefined)

export default WatcherContext
