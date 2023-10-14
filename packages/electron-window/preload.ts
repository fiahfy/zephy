import { ipcRenderer } from 'electron'

export type Operations<T> = {
  restore: () => Promise<{ index: number; params?: T }>
  open: (params?: T) => Promise<void>
}

export const exposeOperations = () => {
  const channelPrefix = 'electron-window'
  return {
    restore: () => ipcRenderer.invoke(`${channelPrefix}-restore`),
    open: (params: { directoryPath: string }) =>
      ipcRenderer.invoke(`${channelPrefix}-open`, params),
  }
}
