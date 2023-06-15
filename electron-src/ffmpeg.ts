import crypto from 'crypto'
import { IpcMainInvokeEvent, app, ipcMain } from 'electron'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'
import ffmpeg from 'fluent-ffmpeg'
import { constants, promises } from 'fs'
import { join } from 'path'

const { access } = promises

type Metadata = {
  duration?: number
  height?: number
  width?: number
}

const registerFfmpegHandlers = () => {
  // @see https://stackoverflow.com/q/63106834
  ffmpeg.setFfmpegPath(
    ffmpegStatic.path.replace('app.asar', 'app.asar.unpacked')
  )
  ffmpeg.setFfprobePath(
    ffprobeStatic.path.replace('app.asar', 'app.asar.unpacked')
  )

  const thumbnailDir = join(app.getPath('userData'), 'thumbnails')

  ipcMain.handle(
    'ffmpeg-metadata',
    async (_event: IpcMainInvokeEvent, path: string): Promise<Metadata> => {
      const metadata = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path, (err, metadata) => {
          err ? reject(err) : resolve(metadata)
        })
      })
      return {
        // TODO: fix any type
        duration: (metadata as any)?.format?.duration,
        height: (metadata as any)?.streams[0]?.height,
        width: (metadata as any)?.streams[0]?.width,
      }
    }
  )
  ipcMain.handle(
    'ffmpeg-thumbnail',
    async (_event: IpcMainInvokeEvent, path: string) => {
      const filename =
        crypto.createHash('md5').update(path).digest('hex') + '.png'
      const thumbnailPath = join(thumbnailDir, filename)
      try {
        await access(path, constants.F_OK)
      } catch (e) {
        await new Promise<void>((resolve, reject) => {
          ffmpeg(path)
            .screenshots({
              count: 1,
              folder: thumbnailDir,
              filename: filename,
            })
            .on('error', (e) => reject(e))
            .on('end', () => resolve())
        })
      }
      return thumbnailPath
    }
  )
}

export default registerFfmpegHandlers
