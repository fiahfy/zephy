import { IpcRendererEvent, ipcRenderer } from 'electron'

export type Operations = {
  addListener: (callback: (visible: boolean) => void) => () => void
  isVisible: () => Promise<boolean>
  setVisible: (visible: boolean) => Promise<void>
}

export const exposeOperations = () => {
  const channelPrefix = 'electron-traffic-light'
  return {
    addListener: (callback: (visible: boolean) => void) => {
      const listener = (_event: IpcRendererEvent, visible: boolean) =>
        callback(visible)
      ipcRenderer.on(`${channelPrefix}-send`, listener)
      return () => ipcRenderer.removeListener(`${channelPrefix}-send`, listener)
    },
    isVisible: () => ipcRenderer.invoke(`${channelPrefix}-is-visible`),
    setVisible: (visible: boolean) =>
      ipcRenderer.invoke(`${channelPrefix}-set-visible`, visible),
  }
}
