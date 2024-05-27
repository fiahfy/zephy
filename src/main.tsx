import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App'
import { DragGhostProvider } from '~/contexts/DragGhostContext'
import { StoreProvider } from '~/contexts/StoreContext'
import { ThemeProvider } from '~/contexts/ThemeContext'
import { ThumbnailProvider } from '~/contexts/ThumbnailContext'
import { TrafficLightProvider } from '~/contexts/TrafficLightContext'
import { WatcherProvider } from '~/contexts/WatcherContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <ThemeProvider>
        <TrafficLightProvider>
          <DragGhostProvider>
            <WatcherProvider>
              <ThumbnailProvider>
                <App />
              </ThumbnailProvider>
            </WatcherProvider>
          </DragGhostProvider>
        </TrafficLightProvider>
      </ThemeProvider>
    </StoreProvider>
  </React.StrictMode>,
)
