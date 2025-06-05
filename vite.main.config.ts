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
        // @see https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/712#issuecomment-1003447792
        'fsevents',
      ],
      plugins: [
        // NOTE: for __dirname on fluent-ffmpeg
        esmShim(),
      ],
    },
  },
})
