import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import type { Operations as StorageOperations } from '@fiahfy/electron-storage/preload'
import type { Operations as WindowOperations } from '@fiahfy/electron-window/preload'
import type {
  ApplicationMenuOperations,
  ElectronOperations,
  EntryOperations,
  MessageOperations,
  WatcherOperations,
} from '~/interfaces'

declare global {
  interface Window {
    applicationMenuAPI: ApplicationMenuOperations
    contextMenuAPI: ContextMenuOperations
    electronAPI: ElectronOperations
    entryAPI: EntryOperations
    messageAPI: MessageOperations
    storageAPI: StorageOperations
    watcherAPI: WatcherOperations
    windowAPI: WindowOperations<{ url: string }>
  }
}
