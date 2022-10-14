import type { Options as GifsicleOptions } from 'imagemin-gifsicle'
import type { Options as SvgoOptions } from 'imagemin-svgo'
import type { Options as MozjpegOptions } from 'imagemin-mozjpeg'
import type { Options as OptipngOptions } from 'imagemin-optipng'
import type { Options as PngquantOptions } from 'imagemin-pngquant'
import type { Options as WebpOptions } from 'imagemin-webp'
import type { Options as JpegOptions } from 'imagemin-jpegtran'

import { Plugin } from 'vite';

type imgType = Array<'jpg' | 'png' | 'svg' | 'gif' | 'jpeg' | 'webp'>
type inputTypes = {
  open?: boolean
  ignoreImagePath?: Array<string>
  imgPath?: Array<string>
  imgType?: imgType
  pluginConfig?: imageminPlugin
};

type fileMap = Array<{ filePath: string, content: Buffer }>;
type viteImageminPlugin = (options?: inputTypes) => Plugin;

interface imageminPlugin {
  gifsicle?: GifsicleOptions
  svgo?: SvgoOptions
  mozjpeg?: MozjpegOptions
  optipng?: OptipngOptions
  pngquant?: PngquantOptions
  webp?: WebpOptions | false
  jpegTran?: JpegOptions
}

export { inputTypes, fileMap, viteImageminPlugin, imageminPlugin, imgType, WebpOptions }