import { createContext } from 'react'

const ExplorerContext = createContext<
  | {
      columns: number
      setColumns: (columns: number) => void
    }
  | undefined
>(undefined)

export default ExplorerContext
