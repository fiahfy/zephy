import { DragEvent, useState } from 'react'

import { Entry } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { move } from 'store/explorer'
import { selectCurrentDirectory } from 'store/window'

const mime = 'application/zephy.path-list'

const useFileDnd = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const dispatch = useAppDispatch()

  const [enterCount, setEnterCount] = useState(0)

  const createDraggableProps = (entries?: Entry[]) => {
    if (!entries) {
      return {}
    }
    return {
      draggable: true,
      onDragStart: (e: DragEvent) => {
        // TODO: native drag drop
        // @see https://www.electronjs.org/ja/docs/latest/tutorial/native-file-drag-drop
        // e.preventDefault()
        e.dataTransfer.setData(mime, JSON.stringify(entries.map((e) => e.path)))
        e.dataTransfer.effectAllowed = 'move'
      },
    }
  }

  const getPaths = (e: DragEvent) => {
    try {
      const json = e.dataTransfer.getData(mime)
      return JSON.parse(json)
    } catch (e) {
      // noop
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.from(e.dataTransfer.files).map((file) => (file as any).path)
  }

  const getDroppableProps = (path: string) => {
    return {
      onDragEnter: (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setEnterCount((count) => count + 1)
      },
      onDragLeave: (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setEnterCount((count) => count - 1)
      },
      onDragOver: (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setEnterCount(0)
        const paths = getPaths(e)
        dispatch(move(paths, path))
      },
    }
  }

  const createDroppableProps = (entry: Entry) =>
    entry.type === 'directory' ? getDroppableProps(entry.path) : {}

  const createCurrentDirectoryDroppableProps = () =>
    getDroppableProps(currentDirectory)

  const dropping = enterCount > 0

  return {
    createCurrentDirectoryDroppableProps,
    createDraggableProps,
    createDroppableProps,
    dropping,
  }
}

export default useFileDnd
