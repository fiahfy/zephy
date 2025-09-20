import { semaphore } from '@fiahfy/semaphore'
import { type ReactNode, useRef } from 'react'
import SemaphoreContext from '~/contexts/SemaphoreContext'

type Props = { children: ReactNode }

const SemaphoreProvider = (props: Props) => {
  const { children } = props

  const s = useRef(semaphore(3))

  const value = { semaphore: s.current }

  return (
    <SemaphoreContext.Provider value={value}>
      {children}
    </SemaphoreContext.Provider>
  )
}

export default SemaphoreProvider
