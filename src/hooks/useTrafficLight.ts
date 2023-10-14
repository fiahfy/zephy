import { useContext } from 'react'
import { TrafficLightContext } from '~/contexts/TrafficLightContext'

const useTrafficLight = () => {
  const context = useContext(TrafficLightContext)
  if (!context) {
    throw new Error('useTrafficLight must be used within a Provider')
  }
  return context
}

export default useTrafficLight
