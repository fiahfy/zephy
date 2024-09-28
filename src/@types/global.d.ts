import type { IElectronAPI } from '~/interfaces'

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
