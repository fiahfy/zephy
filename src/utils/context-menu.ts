import {
  buildContextMenuParams,
  type ContextMenuOption,
} from '@fiahfy/electron-context-menu/renderer'
import type { MouseEvent } from 'react'

export const createContextMenuHandler = (options: ContextMenuOption[] = []) => {
  return (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    window.contextMenuAPI.showContextMenu(
      buildContextMenuParams(e.nativeEvent, options),
    )
  }
}
