import { app } from 'electron'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'
import ffmpeg from 'fluent-ffmpeg'
import { pathExists } from 'fs-extra'
import mime from 'mime'
import { createHash } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

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

const thumbnailDir = join(app.getPath('userData'), 'thumbnails')

const generateThumbnailFilename = async (path: string) => {
  const stats = await stat(path)
  return (
    createHash('md5')
      .update(path + stats.mtimeMs)
      .digest('hex') + '.png'
  )
}

const createThumbnail = async (path: string) => {
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
  } catch (e) {
    return undefined
  }
}

export const createThumbnailUrl = async (paths: string | string[]) => {
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
          return await createThumbnail(path)
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metadata: any = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      err ? reject(err) : resolve(metadata)
    })
  })

  return {
    duration: hasDuration ? metadata?.format?.duration : undefined,
    height: metadata?.streams[0]?.height,
    width: metadata?.streams[0]?.width,
  }
}
