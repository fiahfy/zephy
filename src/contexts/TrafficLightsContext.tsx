import { ReactNode, createContext, useEffect, useState } from 'react'

export const TrafficLightsContext = createContext<
  | {
      visible: boolean
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const TrafficLightsProvider = (props: Props) => {
  const { children } = props

  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const removeListener =
      window.electronAPI.trafficLights.addListener(setVisible)
    return () => removeListener()
  }, [])

  useEffect(() => {
    ;(async () => {
      const visible = await window.electronAPI.trafficLights.isVisible()
      setVisible(visible)
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
