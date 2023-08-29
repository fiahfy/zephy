import crypto from 'crypto'
import { app } from 'electron'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'
import ffmpeg from 'fluent-ffmpeg'
import { pathExists } from 'fs-extra'
import { join } from 'path'

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
  return thumbnailPath
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
