import '@fontsource/roboto/300'
import '@fontsource/roboto/400'
import '@fontsource/roboto/500'
import '@fontsource/roboto/700'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App'
import StoreProvider from '~/providers/StoreProvider'
import ThemeProvider from '~/providers/ThemeProvider'
import TrafficLightProvider from '~/providers/TrafficLightProvider'
import WatcherProvider from '~/providers/WatcherProvider'

import { invoke } from '@tauri-apps/api/core'

window.electronAPI = {
  restore: () => ({
    id: 1,
    params: {
      directoryPath: '/',
    },
  }),
  onTrafficLightVisibilityChange: () => () => undefined,
  getTrafficLightVisibility: () => true,
  getRootEntry: () => ({ name: 'name', path: 'path', type: 'file', url: '' }),
  onMessage: () => () => undefined,
  onFocusChange: () => () => undefined,
  watchDirectories: () => undefined,
  isFocused: () => false,
  getEntries: async (directoryPath: string) =>
    await invoke('get_entries', { directoryPath }),
  getEntriesForPaths: async (paths: string[]) =>
    await invoke('get_entries_for_paths', { paths }),
  getEntry: async (path: string) => await invoke('get_entry', { path }),
  getParentEntry: async (path: string) =>
    await invoke('get_parent_entry', { path }),
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StoreProvider>
      <ThemeProvider>
        <TrafficLightProvider>
          <WatcherProvider>
            <App />
          </WatcherProvider>
        </TrafficLightProvider>
      </ThemeProvider>
    </StoreProvider>
  </React.StrictMode>,
)
