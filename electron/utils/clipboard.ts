import { clipboard } from 'electron'
import { build, parse } from 'plist'

// @see https://github.com/electron/electron/issues/9035#issuecomment-359554116
const format = 'NSFilenamesPboardType'

export const canPaste = () => clipboard.has(format)

export const paste = () => {
  if (!canPaste()) {
    return
  }
  const buffer = clipboard.readBuffer(format)
  const paths = parse(buffer.toString())
  if (!Array.isArray(paths)) {
    return []
  }
  return paths
}

export const copy = (paths: string[]) => {
  const buffer = Buffer.from(build(paths))
  clipboard.writeBuffer(format, buffer)
}
