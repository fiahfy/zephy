import { ReactNode, createContext, useState } from 'react'

export const ExplorerContext = createContext<
  | {
      columns: number
      setColumns: (columns: number) => void
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const ExplorerProvider = (props: Props) => {
  const { children } = props

  const [columns, setColumns] = useState(1)

  const value = { columns, setColumns }

  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  )
}
