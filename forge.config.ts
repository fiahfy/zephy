// import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerDMG } from '@electron-forge/maker-dmg'
// import { MakerRpm } from '@electron-forge/maker-rpm'
// import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { PublisherGithub } from '@electron-forge/publisher-github'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      // @see https://github.com/electron/forge/issues/1693
      unpack: '**/{.**,**}/**/{ffmpeg,ffprobe}',
    },
    // @see https://github.com/electron/forge/issues/3738#issuecomment-2692534953
    ignore: [
      /node_modules\/(?!(ffmpeg-static-electron|ffprobe-static-electron|fsevents)\/)/,
    ],
    icon: 'build/icon',
    // @see https://github.com/electron-userland/electron-builder/blob/a6be444c90e59bbe92c53e94d7a5070f1399651f/packages/app-builder-lib/src/macPackager.ts#L233
    osxSign: {
      identity: '-',
      identityValidation: false,
      optionsForFile: () => {
        return {
          entitlements: 'build/entitlements.plist',
        }
      },
    },
  },
  rebuildConfig: {},
  makers: [
    // new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    // new MakerRpm({}),
    // new MakerDeb({}),
    new MakerDMG(
      {
        icon: 'build/icon.icns',
        background: 'build/background.png',
        // @see https://github.com/electron-userland/electron-builder/blob/9272cf33a8e3b788979010706e9c564e954a2ee7/packages/dmg-builder/src/dmg.ts#L182
        contents: (opts) => [
          {
            x: 130,
            y: 220,
            type: 'file',
            path: opts.appPath,
          },
          {
            x: 410,
            y: 220,
            type: 'link',
            path: '/Applications',
          },
        ],
      },
      ['darwin'],
    ),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src-electron/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src-electron/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
    new AutoUnpackNativesPlugin({}),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'fiahfy',
        name: 'zephy',
      },
      prerelease: !!process.env.PRE_RELEASE,
      draft: !process.env.PRE_RELEASE,
      generateReleaseNotes: true,
    }),
  ],
}

export default config
