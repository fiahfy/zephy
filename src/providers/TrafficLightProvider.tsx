import { type ReactNode, useCallback, useEffect, useState } from 'react'
import TrafficLightContext from '~/contexts/TrafficLightContext'

type Props = { children: ReactNode }

const TrafficLightProvider = (props: Props) => {
  const { children } = props

  const [ready, setReady] = useState(false)
  const [visibility, setVisibility] = useState(false)

  const setVisible = useCallback((visible: boolean) => {
    window.electronAPI.setTrafficLightVisibility(visible)
  }, [])

  useEffect(() => {
    const removeListener =
      window.electronAPI.onTrafficLightVisibilityChange(setVisibility)
    return () => removeListener()
  }, [])

  useEffect(() => {
    ;(async () => {
      const visibility = await window.electronAPI.getTrafficLightVisibility()
      setVisibility(visibility)
      // NOTE: For initial rendering
      setReady(true)
    })()
  }, [])

  const value = { setVisible, visible: visibility }

  return (
    <TrafficLightContext.Provider value={value}>
      {ready && children}
    </TrafficLightContext.Provider>
  )
}

export default TrafficLightProvider
