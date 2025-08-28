import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'
import ffmpeg, { type FfprobeData } from 'fluent-ffmpeg'
import { pathExists, stat } from 'fs-extra'
import mime from 'mime'

// @see https://stackoverflow.com/q/63106834
ffmpeg.setFfmpegPath(ffmpegStatic.path.replace('app.asar', 'app.asar.unpacked'))
ffmpeg.setFfprobePath(
  ffprobeStatic.path.replace('app.asar', 'app.asar.unpacked'),
)

type Metadata = {
  duration?: number
  height?: number
  width?: number
}

const generateThumbnailFilename = async (path: string) => {
  const stats = await stat(path)
  const basename = createHash('md5')
    .update(path + stats.mtimeMs)
    .digest('hex')
  return `${basename}.png`
}

const createThumbnail = async (path: string, thumbnailDir: string) => {
  try {
    const thumbnailFilename = await generateThumbnailFilename(path)
    const thumbnailPath = join(thumbnailDir, thumbnailFilename)
    const exists = await pathExists(thumbnailPath)
    if (!exists) {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(path)
          .screenshots({
            count: 1,
            folder: thumbnailDir,
            filename: thumbnailFilename,
          })
          .on('error', (e) => reject(e))
          .on('end', () => resolve())
      })
    }
    return pathToFileURL(thumbnailPath).href
  } catch {
    return undefined
  }
}

export const createThumbnailUrl = async (
  paths: string | string[],
  thumbnailDir: string,
) => {
  return (Array.isArray(paths) ? paths : [paths]).reduce(
    async (promise, path) => {
      const acc = await promise
      if (acc) {
        return acc
      }

      const type = mime.getType(path)
      if (!type) {
        return undefined
      }

      switch (true) {
        case type.startsWith('image/'):
          return pathToFileURL(path).href
        case type.startsWith('video/'):
          return await createThumbnail(path, thumbnailDir)
        default:
          return undefined
      }
    },
    Promise.resolve(undefined) as Promise<string | undefined>,
  )
}

export const getMetadata = async (
  path: string,
): Promise<Metadata | undefined> => {
  const type = mime.getType(path)
  if (!type) {
    return undefined
  }

  if (
    !type.startsWith('image/') &&
    !type.startsWith('video/') &&
    !type.startsWith('audio/')
  ) {
    return undefined
  }

  const hasDuration = type.startsWith('video/') || type.startsWith('audio/')

  const metadata = await new Promise<FfprobeData | undefined>((resolve) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      resolve(err ? undefined : metadata)
    })
  })

  return {
    duration: hasDuration ? metadata?.format?.duration : undefined,
    height: metadata?.streams[0]?.height,
    width: metadata?.streams[0]?.width,
  }
}
