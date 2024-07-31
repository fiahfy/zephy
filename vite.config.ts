import alias from '@rollup/plugin-alias'
import esmShim from '@rollup/plugin-esm-shim'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import { startup } from 'vite-plugin-electron'
import electron from 'vite-plugin-electron/simple'
import tsconfigPaths from 'vite-tsconfig-paths'

// @see https://twitter.com/fiahfy/status/1801860274736996514
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process {
      electronApp: import('node:child_process').ChildProcess
    }
  }
}

startup.exit = async () => {
  if (process.electronApp) {
    process.electronApp.removeAllListeners()
    process.electronApp.kill()
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'ffmpeg-static-electron',
                'ffprobe-static-electron',
                // @see https://github.com/paulmillr/chokidar/issues/1000
                // @see https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/712
                'fsevents',
              ],
              // @see https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/1210#issuecomment-1614992707
              plugins: [
                alias({
                  entries: [
                    {
                      find: './lib-cov/fluent-ffmpeg',
                      replacement: './lib/fluent-ffmpeg',
                    },
                  ],
                }),
                // for __dirname on fluent-ffmpeg
                esmShim(),
              ],
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Polyfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the \`nodeIntegration\` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === 'test'
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {},
    }),
    tsconfigPaths(),
  ],
})
