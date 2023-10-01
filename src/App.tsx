import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import Layout from '~/components/Layout'
import { DragGhostProvider } from '~/contexts/DragGhostContext'
import { StoreProvider } from '~/contexts/StoreContext'
import { ThemeProvider } from '~/contexts/ThemeContext'
import { TrafficLightsProvider } from '~/contexts/TrafficLightsContext'
import { WatcherProvider } from '~/contexts/WatcherContext'
import IndexPage from '~/pages'

const App = () => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <TrafficLightsProvider>
          <WatcherProvider>
            <DragGhostProvider>
              <Layout>
                <IndexPage />
              </Layout>
            </DragGhostProvider>
          </WatcherProvider>
        </TrafficLightsProvider>
      </ThemeProvider>
    </StoreProvider>
  )
}

export default App
