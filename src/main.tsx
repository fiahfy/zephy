import '@fontsource/roboto/300'
import '@fontsource/roboto/400'
import '@fontsource/roboto/500'
import '@fontsource/roboto/700'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App'
import SemaphoreProvider from '~/providers/SemaphoreProvider'
import StoreProvider from '~/providers/StoreProvider'
import ThemeProvider from '~/providers/ThemeProvider'
import TrafficLightProvider from '~/providers/TrafficLightProvider'
import WatcherProvider from '~/providers/WatcherProvider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StoreProvider>
      <ThemeProvider>
        <TrafficLightProvider>
          <WatcherProvider>
            <SemaphoreProvider>
              <App />
            </SemaphoreProvider>
          </WatcherProvider>
        </TrafficLightProvider>
      </ThemeProvider>
    </StoreProvider>
  </React.StrictMode>,
)
