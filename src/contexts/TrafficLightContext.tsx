import { ReactNode, createContext, useEffect, useState } from 'react'

export const TrafficLightContext = createContext<
  | {
      visible: boolean
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const TrafficLightProvider = (props: Props) => {
  const { children } = props

  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const removeListener =
      window.electronAPI.trafficLight.addListener(setVisible)
    return () => removeListener()
  }, [])

  useEffect(() => {
    ;(async () => {
      const visible = await window.electronAPI.trafficLight.isVisible()
      setVisible(visible)
      // for initial rendering
      setReady(true)
    })()
  }, [])

  const value = { visible }

  return (
    <TrafficLightContext.Provider value={value}>
      {ready && children}
    </TrafficLightContext.Provider>
  )
}
