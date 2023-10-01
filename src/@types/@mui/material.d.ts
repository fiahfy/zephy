import { CSSProperties } from 'react'

declare module '@mui/material/styles/createMixins' {
  interface Mixins {
    addressBar: CSSProperties
    statusBar: CSSProperties
  }
}
