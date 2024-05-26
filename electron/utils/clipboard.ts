import { clipboard } from 'electron'
import { build, parse } from 'plist'

// @see https://github.com/electron/electron/issues/9035#issuecomment-359554116
const format = 'NSFilenamesPboardType'

export const canReadPaths = () => clipboard.has(format)

export const readPaths = () => {
  if (!canReadPaths()) {
    return
  }
  const buffer = clipboard.readBuffer(format)
  const paths = parse(buffer.toString())
  if (!Array.isArray(paths)) {
    return []
  }
  return paths
}

export const writePaths = (paths: string[]) => {
  const buffer = Buffer.from(build(paths))
  clipboard.writeBuffer(format, buffer)
}
