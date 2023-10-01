import { useContext } from 'react'
import { TrafficLightsContext } from '~/contexts/TrafficLightsContext'

const useTrafficLights = () => {
  const context = useContext(TrafficLightsContext)
  if (!context) {
    throw new Error('useTrafficLights must be used within a Provider')
  }
  return context
}

export default useTrafficLights
