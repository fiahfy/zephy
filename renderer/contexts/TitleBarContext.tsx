import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const TitleBarContext = createContext<
  | {
      visible: boolean
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const TitleBarProvider = (props: Props) => {
  const { children } = props

  const [ready, setReady] = useState(false)
  const [darwin, setDarwin] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const visible = useMemo(() => darwin && !fullscreen, [darwin, fullscreen])

  useEffect(() => {
    ;(async () => {
      const darwin = await window.electronAPI.isDarwin()
      setDarwin(darwin)
      const fullscreen = await window.electronAPI.isFullscreen()
      setFullscreen(fullscreen)
      // for initial rendering
      setReady(true)
    })()

    const unsubscribe = window.electronAPI.subscribe((eventName, params) => {
      if (eventName === 'changeFullscreen') {
        setFullscreen(params.fullscreen)
      }
    })

    return () => unsubscribe()
  }, [])

  const value = { visible }

  return (
    <TitleBarContext.Provider value={value}>
      {ready && children}
    </TitleBarContext.Provider>
  )
}

export const useTitleBar = () => {
  const context = useContext(TitleBarContext)
  if (!context) {
    throw new Error('useTitleBar must be used within a Provider')
  }
  return context
}
