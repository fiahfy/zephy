import crypto from 'crypto'
import { IpcMainInvokeEvent, app, ipcMain } from 'electron'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'
import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'

const registerFfmpegHandlers = () => {
  // @see https://stackoverflow.com/q/63106834
  ffmpeg.setFfmpegPath(
    ffmpegStatic.path.replace('app.asar', 'app.asar.unpacked')
  )
  ffmpeg.setFfprobePath(
    ffprobeStatic.path.replace('app.asar', 'app.asar.unpacked')
  )

  const thumbnailDir = join(app.getPath('userData'), 'thumbnails')

  const createThumbnail = (path: string) => {
    const filename =
      crypto.createHash('md5').update(path).digest('hex') + '.png'
    return new Promise<string>((resolve, reject) => {
      ffmpeg(path)
        .screenshots({
          count: 1,
          folder: thumbnailDir,
          filename: filename,
        })
        .on('error', (e) => reject(e))
        .on('end', () => resolve(join(thumbnailDir, filename)))
    })
  }

  ipcMain.handle(
    'ffmpeg-thumbnail',
    (_event: IpcMainInvokeEvent, path: string) => createThumbnail(path)
  )
}

export default registerFfmpegHandlers
