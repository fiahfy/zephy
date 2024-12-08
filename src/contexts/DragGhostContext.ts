import { type ReactNode, type RefObject, createContext } from 'react'

const DragGhostContext = createContext<
  | {
      render: (node: ReactNode) => RefObject<HTMLDivElement | null>
    }
  | undefined
>(undefined)

export default DragGhostContext
