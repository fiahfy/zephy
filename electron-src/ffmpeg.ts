import crypto from 'crypto'
import { IpcMainInvokeEvent, app, ipcMain } from 'electron'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'
import ffmpeg from 'fluent-ffmpeg'
import { constants, promises } from 'fs'
import { join } from 'path'

const { access } = promises

const registerFfmpegHandlers = () => {
  // @see https://stackoverflow.com/q/63106834
  ffmpeg.setFfmpegPath(
    ffmpegStatic.path.replace('app.asar', 'app.asar.unpacked')
  )
  ffmpeg.setFfprobePath(
    ffprobeStatic.path.replace('app.asar', 'app.asar.unpacked')
  )

  const thumbnailDir = join(app.getPath('userData'), 'thumbnails')

  const createThumbnail = async (imagePath: string) => {
    const filename =
      crypto.createHash('md5').update(imagePath).digest('hex') + '.png'
    const path = join(thumbnailDir, filename)
    try {
      await access(path, constants.F_OK)
    } catch (e) {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(imagePath)
          .screenshots({
            count: 1,
            folder: thumbnailDir,
            filename: filename,
          })
          .on('error', (e) => reject(e))
          .on('end', () => resolve())
      })
    }
    return path
  }

  ipcMain.handle(
    'ffmpeg-thumbnail',
    (_event: IpcMainInvokeEvent, path: string) => createThumbnail(path)
  )
}

export default registerFfmpegHandlers
