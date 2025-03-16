import {
  type ContextMenuOption,
  buildContextMenuParams,
} from '@fiahfy/electron-context-menu/renderer'
import type { MouseEvent } from 'react'

export const createContextMenuHandler = (options: ContextMenuOption[] = []) => {
  return (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    window.electronAPI.showContextMenu(
      buildContextMenuParams(e.nativeEvent, options),
    )
  }
}
