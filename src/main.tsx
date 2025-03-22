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

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById('root')!).render(
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
