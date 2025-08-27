import { createContext } from 'react'
import type { FileEventHandler } from '~/interfaces'

export const WatcherContext = createContext<
  | {
      unwatch: (key: string) => void
      watch: (
        key: string,
        directoryPaths: string[],
        handler: FileEventHandler,
      ) => void
    }
  | undefined
>(undefined)

export default WatcherContext
