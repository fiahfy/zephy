import { MouseEvent } from 'react'
import { ContextMenuOption } from '~/interfaces'

export const createMenuHandler = (options: ContextMenuOption[] = []) => {
  return async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const isEditable =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
        ? !e.target.readOnly
        : false
    const selectionText = window.getSelection()?.toString() ?? ''
    const { clientX: x, clientY: y } = e

    const params = { isEditable, options, selectionText, x, y }

    await window.electronAPI.showContextMenu(params)
  }
}
