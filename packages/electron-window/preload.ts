import { ipcRenderer } from 'electron'

export type Operations<T> = {
  restoreWindow: () => Promise<{ index: number; params?: T }>
  openWindow: (params?: T) => Promise<void>
}

export const exposeOperations = <T>() => {
  return {
    restoreWindow: () => ipcRenderer.invoke('restoreWindow'),
    openWindow: (params: T) => ipcRenderer.invoke('openWindow', params),
  }
}
