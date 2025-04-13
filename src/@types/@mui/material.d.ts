import type { CSSProperties } from 'react'

declare module '@mui/material' {
  interface Mixins {
    addressBar: CSSProperties
    statusBar: CSSProperties
  }
}
