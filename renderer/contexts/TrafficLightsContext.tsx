import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const TrafficLightsContext = createContext<
  | {
      visible: boolean
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const TrafficLightsProvider = (props: Props) => {
  const { children } = props

  const [ready, setReady] = useState(false)
  const [darwin, setDarwin] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const visible = useMemo(() => darwin && !fullscreen, [darwin, fullscreen])

  useEffect(() => {
    const removeListener =
      window.electronAPI.fullscreen.addListener(setFullscreen)
    return () => removeListener()
  }, [])

  useEffect(() => {
    ;(async () => {
      const darwin = await window.electronAPI.isDarwin()
      setDarwin(darwin)
      const fullscreen = await window.electronAPI.fullscreen.isEntered()
      setFullscreen(fullscreen)
      // for initial rendering
      setReady(true)
    })()
  }, [])

  const value = { visible }

  return (
    <TrafficLightsContext.Provider value={value}>
      {ready && children}
    </TrafficLightsContext.Provider>
  )
}

export const useTrafficLights = () => {
  const context = useContext(TrafficLightsContext)
  if (!context) {
    throw new Error('useTrafficLights must be used within a Provider')
  }
  return context
}
