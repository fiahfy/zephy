import crypto from 'crypto'
import { app } from 'electron'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'
import ffmpeg from 'fluent-ffmpeg'
import { constants, promises } from 'fs'
import { join } from 'path'

const { access } = promises

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

export const createThumbnail = async (path: string) => {
  const thumbnailFilename =
    crypto.createHash('md5').update(path).digest('hex') + '.png'
  const thumbnailPath = join(thumbnailDir, thumbnailFilename)
  try {
    await access(thumbnailPath, constants.F_OK)
  } catch (e) {
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
  return thumbnailPath
}

export const createVideoThumbnails = async (path: string) => {
  const count = 9
  const thumbnailFilename =
    crypto.createHash('md5').update(path).digest('hex') + '_%i.png'
  const thumbnailFilenames = Array(count)
    .fill(1)
    .map((_, i) => thumbnailFilename.replace('%i', String(i + 1)))
  const thumbnailPaths = thumbnailFilenames.map((filename) =>
    join(thumbnailDir, filename),
  )
  try {
    await Promise.all(
      thumbnailPaths.map((path) => access(path), constants.F_OK),
    )
  } catch (e) {
    await Promise.all(
      thumbnailFilenames.map((filename, i) => {
        const percentage = `${(100 / (count + 1)) * i}%`
        return new Promise<void>((resolve, reject) => {
          ffmpeg(path)
            .screenshots({
              timestamps: [percentage],
              folder: thumbnailDir,
              filename,
            })
            .on('error', (e) => reject(e))
            .on('end', () => resolve())
        })
      }),
    )
  }
  return thumbnailPaths
}

export const getMetadata = async (path: string): Promise<Metadata> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metadata: any = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      err ? reject(err) : resolve(metadata)
    })
  })
  return {
    duration: metadata?.format?.duration,
    height: metadata?.streams[0]?.height,
    width: metadata?.streams[0]?.width,
  }
}
