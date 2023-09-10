import {
  ReactNode,
  RefObject,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'

const DragGhostContext = createContext<
  | {
      render: (node: ReactNode) => RefObject<HTMLDivElement>
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const DragGhostProvider = (props: Props) => {
  const { children } = props

  const [node, setNode] = useState<ReactNode>()
  const ref = useRef<HTMLDivElement>(null)

  const render = (node: ReactNode) => {
    setNode(node)
    return ref
  }

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

export const useDragGhost = () => {
  const context = useContext(DragGhostContext)
  if (!context) {
    throw new Error('useDragGhost must be used within a Provider')
  }
  return context
}
