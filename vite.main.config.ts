import alias from '@rollup/plugin-alias'
import esmShim from '@rollup/plugin-esm-shim'
import { defineConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig({
  build: {
    // @see https://github.com/electron/forge/issues/3439#issuecomment-2705114147
    lib: {
      entry: 'src-electron/main.ts',
      fileName: 'main',
      formats: ['es'],
    },
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
})
