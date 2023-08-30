import { DragEvent, useCallback, useMemo, useState } from 'react'

import { Entry } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { move } from 'store/explorer'
import { selectCurrentDirectory } from 'store/window'

const mime = 'application/zephy.path-list'

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

const setPaths = (e: DragEvent, paths: string[]) =>
  e.dataTransfer.setData(mime, JSON.stringify(paths))

const useDnd = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const dispatch = useAppDispatch()

  const [enterCount, setEnterCount] = useState(0)

  const dropping = useMemo(() => enterCount > 0, [enterCount])

  const createDraggableBinder = useCallback((entries?: Entry | Entry[]) => {
    if (!entries) {
      return {}
    }
    const es = Array.isArray(entries) ? entries : [entries]
    return {
      draggable: true,
      onDragStart: (e: DragEvent) => {
        // TODO: native drag and drop
        // @see https://www.electronjs.org/ja/docs/latest/tutorial/native-file-drag-drop
        // e.preventDefault()
        e.stopPropagation()
        // TODO: improve dragging elements
        e.dataTransfer.effectAllowed = 'move'
        setPaths(
          e,
          es.map((e) => e.path),
        )
      },
    }
  }, [])

  const getDroppableBinder = useCallback(
    (path: string) => {
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
    },
    [dispatch],
  )

  const createDroppableBinder = useCallback(
    (entry: Entry) =>
      entry.type === 'directory' ? getDroppableBinder(entry.path) : {},
    [getDroppableBinder],
  )

  const createCurrentDirectoryDroppableBinder = useCallback(
    () => getDroppableBinder(currentDirectory),
    [currentDirectory, getDroppableBinder],
  )

  return {
    createCurrentDirectoryDroppableBinder,
    createDraggableBinder,
    createDroppableBinder,
    dropping,
  }
}

export default useDnd
