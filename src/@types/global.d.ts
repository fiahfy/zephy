import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
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
    electronAPI: ElectronOperations
    entryAPI: EntryOperations
    messageAPI: MessageOperations
    watcherAPI: WatcherOperations
    contextMenuAPI: ContextMenuOperations
    windowAPI: WindowOperations<{ url: string }>
  }
}
