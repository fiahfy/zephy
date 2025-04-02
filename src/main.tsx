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

window.electronAPI = {
  restore: () => ({ id: 1, params: { directoryPath: '/' } }),
  onTrafficLightVisibilityChange: () => () => undefined,
  getTrafficLightVisibility: () => true,
  getRootEntry: () => ({ name: 'name', path: 'path', type: 'file', url: '' }),
  onMessage: () => () => undefined,
  onFocusChange: () => () => undefined,
  watchDirectories: () => undefined,
  isFocused: () => false,
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
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
