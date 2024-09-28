import {
  type ContextMenuOption,
  buildContextMenuParams,
} from '@fiahfy/electron-context-menu/renderer'
import type { MouseEvent } from 'react'

export const createContextMenuHandler = (options: ContextMenuOption[] = []) => {
  return async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    await window.electronAPI.showContextMenu(
      buildContextMenuParams(e.nativeEvent, options),
    )
  }
}
