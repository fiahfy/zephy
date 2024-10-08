import { createContext } from 'react'

type EventType = 'create' | 'update' | 'delete'

export type Callback = (
  eventType: EventType,
  directoryPath: string,
  filePath: string,
) => void

export const WatcherContext = createContext<
  | {
      watch: (key: string, directoryPaths: string[], callback: Callback) => void
    }
  | undefined
>(undefined)

export default WatcherContext
