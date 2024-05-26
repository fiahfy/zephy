import { join } from 'node:path'
import { Worker } from 'node:worker_threads'

export const postMessage = (type: string, ...args: unknown[]) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(join(__dirname, 'worker.js'))
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
    worker.postMessage({ type, data: args })
  })
}
