import { type ReactNode, useState } from 'react'
import ExplorerContext from '~/contexts/ExplorerContext'

type Props = { children: ReactNode }

const ExplorerProvider = (props: Props) => {
  const { children } = props

  const [columns, setColumns] = useState(1)

  const value = { columns, setColumns }

  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  )
}

export default ExplorerProvider
