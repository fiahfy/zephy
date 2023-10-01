import alias from '@rollup/plugin-alias'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'
import tsconfigPaths from 'vite-tsconfig-paths'

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
      // Ployfill the Electron and Node.js built-in modules for Renderer process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: {},
    }),
    tsconfigPaths(),
  ],
})
