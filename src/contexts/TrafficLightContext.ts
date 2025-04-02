import { createContext } from 'react'

const TrafficLightContext = createContext<
  | {
      setVisible: (visible: boolean) => void
      visible: boolean
    }
  | undefined
>(undefined)

export default TrafficLightContext
