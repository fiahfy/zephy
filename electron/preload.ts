import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ApplicationMenuParams } from './applicationMenu'
import { ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  applicationMenu: {
    update: (params: ApplicationMenuParams) =>
      ipcRenderer.invoke('application-menu-update', params),
  },
  contextMenu: {
    show: (params: ContextMenuParams) =>
      ipcRenderer.invoke('context-menu-show', params),
  },
  entry: {
    copy: (paths: string[]) => ipcRenderer.invoke('entry-copy', paths),
    createDirectory: (directoryPath: string) =>
      ipcRenderer.invoke('entry-create-directory', directoryPath),
    createThumbnailUrl: (paths: string | string[]) =>
      ipcRenderer.invoke('entry-create-thumbnail-url', paths),
    getDetailedEntries: (directoryPath: string) =>
      ipcRenderer.invoke('entry-get-detailed-entries', directoryPath),
    getDetailedEntriesForPaths: (paths: string[]) =>
      ipcRenderer.invoke('entry-get-detailed-entries-for-paths', paths),
    getDetailedEntry: (path: string) =>
      ipcRenderer.invoke('entry-get-detailed-entry', path),
    getEntries: (directoryPath: string) =>
      ipcRenderer.invoke('entry-get-entries', directoryPath),
    getEntryHierarchy: (path?: string) =>
      ipcRenderer.invoke('entry-get-entry-hierarchy', path),
    getMetadata: (path: string) =>
      ipcRenderer.invoke('entry-get-metadata', path),
    move: (paths: string[], directoryPath: string) =>
      ipcRenderer.invoke('entry-move', paths, directoryPath),
    moveToTrash: (paths: string[]) =>
      ipcRenderer.invoke('entry-move-to-trash', paths),
    open: (path: string) => ipcRenderer.invoke('entry-open', path),
    paste: (directoryPath: string) =>
      ipcRenderer.invoke('entry-paste', directoryPath),
    rename: (path: string, newName: string) =>
      ipcRenderer.invoke('entry-rename', path, newName),
  },
  fullscreen: {
    addListener: (callback: (fullscreen: boolean) => void) => {
      const listener = (_event: IpcRendererEvent, fullscreen: boolean) =>
        callback(fullscreen)
      ipcRenderer.on('fullscreen-send', listener)
      return () => ipcRenderer.removeListener('fullscreen-send', listener)
    },
    isEntered: () => ipcRenderer.invoke('fullscreen-is-entered'),
  },
  message: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listener = (_event: IpcRendererEvent, message: any) =>
        callback(message)
      ipcRenderer.on('message-send', listener)
      return () => ipcRenderer.removeListener('message-send', listener)
    },
  },
  node: {
    basename: (path: string) => ipcRenderer.invoke('node-basename', path),
    dirname: (path: string) => ipcRenderer.invoke('node-dirname', path),
    isDarwin: () => ipcRenderer.invoke('node-is-darwin'),
  },
  watcher: {
    watch: (
      directoryPaths: string[],
      callback: (
        eventType: 'create' | 'delete',
        directoryPath: string,
        filePath: string,
      ) => void,
    ) => {
      ipcRenderer.removeAllListeners('watcher-notify')
      ipcRenderer.on(
        'watcher-notify',
        (
          _event: IpcRendererEvent,
          eventType: 'create' | 'delete',
          directoryPath: string,
          filePath: string,
        ) => callback(eventType, directoryPath, filePath),
      )
      return ipcRenderer.invoke('watcher-watch', directoryPaths)
    },
  },
  window: {
    restore: () => ipcRenderer.invoke('window-restore'),
    open: (params: { directory: string }) =>
      ipcRenderer.invoke('window-open', params),
  },
})

// TODO: fix this
/* eslint-disable @typescript-eslint/no-explicit-any,react-hooks/rules-of-hooks */

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer))

// `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
function withPrototype(obj: Record<string, any>) {
  const protos = Object.getPrototypeOf(obj)

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue

    if (typeof value === 'function') {
      // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
      obj[key] = function (...args: any) {
        return value.call(obj, ...args)
      }
    } else {
      obj[key] = value
    }
  }
  return obj
}

// --------- Preload scripts loading ---------
function domReady(
  condition: DocumentReadyState[] = ['complete', 'interactive'],
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)
