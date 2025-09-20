import type { semaphore } from '@fiahfy/semaphore'
import { createContext } from 'react'

const SemaphoreContext = createContext<
  | {
      semaphore: ReturnType<typeof semaphore>
    }
  | undefined
>(undefined)

export default SemaphoreContext
