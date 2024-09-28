import { type ReactNode, useCallback, useRef, useState } from 'react'
import DragGhostContext from '~/contexts/DragGhostContext'

type Props = { children: ReactNode }

const DragGhostProvider = (props: Props) => {
  const { children } = props

  const [node, setNode] = useState<ReactNode>()
  const ref = useRef<HTMLDivElement>(null)

  const render = useCallback((node: ReactNode) => {
    setNode(node)
    return ref
  }, [])

  const value = { render }

  return (
    <DragGhostContext.Provider value={value}>
      {children}
      <div ref={ref} style={{ position: 'absolute', top: -9999, left: -9999 }}>
        {node}
      </div>
    </DragGhostContext.Provider>
  )
}

export default DragGhostProvider
