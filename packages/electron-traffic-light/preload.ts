import { IpcRendererEvent, ipcRenderer } from 'electron'

export type Operations = {
  addTrafficLightListener: (
    callback: (visibility: boolean) => void,
  ) => () => void
  getTrafficLightVisibility: () => Promise<boolean>
  setTrafficLightVisibility: (visibility: boolean) => Promise<void>
}

export const exposeOperations = () => {
  return {
    addTrafficLightListener: (callback: (visibility: boolean) => void) => {
      const listener = (_event: IpcRendererEvent, visibility: boolean) =>
        callback(visibility)
      ipcRenderer.on('sendTrafficLightVisibility', listener)
      return () =>
        ipcRenderer.removeListener('sendTrafficLightVisibility', listener)
    },
    getTrafficLightVisibility: () =>
      ipcRenderer.invoke('getTrafficLightVisibility'),
    setTrafficLightVisibility: (visibility: boolean) =>
      ipcRenderer.invoke('setTrafficLightVisibility', visibility),
  }
}
