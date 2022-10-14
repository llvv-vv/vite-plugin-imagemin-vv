import { Plugin } from 'vite';
import fs from 'fs'
import { globby } from 'globby'
import chalk from 'chalk'
import ora from 'ora'
import imagemin from 'imagemin'
import imageminGifsicle from 'imagemin-gifsicle'
import imageminOptpng from 'imagemin-optipng'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'
import imageminWebp from 'imagemin-webp'

import { inputTypes, fileMap, viteImageminPlugin, imageminPlugin, imgType, WebpOptions } from './types'
import { isTrue, isDirectory, getAbsPath, filter, fsStat, initDefaultOpt } from './helper'

// 读取根目录缓存文件vv.imagemin.json过滤不需要压缩的文件，如果没有则会自动生成这个文件
// 更多图片类型的插件请参考 https://github.com/orgs/imagemin/repositories?type=all

// 插件
const plugins: Array<any> = []
// 临时缓存
let fileStat = new Map()
// 压缩总共耗时
let time: number = 0
// 控制台样式美化
const spinner = ora('开始压缩图片...')
// 入口文件
const viteImagemin: viteImageminPlugin = (opt) => {
  return {
    name: 'vv-imagemin',
    // 仅在运行build时调用此插件，可以用函数来进行更加精确的控制 具体参照 https://cn.vitejs.dev/guide/api-plugin.html#conditional-application
    apply: 'build',
    // buildStart是在每次开始构建时调用，而严格意义上来讲config执行时机是在构建阶段之前先获取vite配置
    config: async () => {
      const configOpt = initDefaultOpt(opt)
      if (!configOpt.open) return console.info('\n已设置关闭图片压缩，若想打开请设置open为true\n')
      await init(configOpt)
    }
  }
}
// 初始化
const init = async (opt: inputTypes) => {
  spinner.start()
  // 所有图片绝对路径地址 没有图片直接跳出
  const allImgAbsPaths = await initImgPaths(opt)
  // 空数组直接跳过
  if (allImgAbsPaths.length == 0) {
    spinner.stop()
    return console.info('\n目录下没有需要压缩的图片，已跳出')
  }
  // 缓存的绝对路径地址
  const cacheAbsPath: string = await initCachePath()
  // 获取缓存文件内容
  const cache: any = JSON.parse(await promiseReadFile(cacheAbsPath))
  // 过滤缓存后 需要压缩的图片列表
  spinner.text = '获取需要压缩的文件'
  const compressFilePaths = await filter(allImgAbsPaths, async (filePath: string) => {
    // 缓存文件中存在的图片修改时间
    let cacheTimeMs = cache[filePath]
    // lastEditTimes 最后一次修改文件的时间戳
    let lastEditTimes = await fsStat(filePath)
    // cacheTimes和lastEditTimes是系统时间戳，比Date.now()更精准，多了小数点后三位
    // 所以控制在1ms内都认为是有效缓存
    if (!cacheTimeMs) {
      // 未缓存过 加入缓存
      fileStat.set(filePath, {
        lastEditTimes
      })
      return true
    } else {
      // 就算有缓存，可能UI重新改图了，开发人员用新图直接覆盖旧图，此时也要重新压缩
      if (Math.abs(cacheTimeMs - lastEditTimes) > 1) {
        fileStat.set(filePath, { lastEditTimes })
        return true
      } else {
        return false
      }
    }
  })
  // 空数组直接跳过
  if (compressFilePaths.length == 0) {
    spinner.stop()
    return console.info('\n目录下的图片已全部压缩过，无需再次压缩')
  }
  // 把plugin配置添加到plugin数组中
  initPlugin(opt.pluginConfig as imageminPlugin, opt.imgType as imgType)
  // 进行图片压缩处理
  const resolvedFileMap = await compressFiles(compressFilePaths)
  spinner.text = '图片压缩完成，覆盖源文件中'
  // 覆盖图片源文件
  await writeFiles(resolvedFileMap, cache)
  spinner.text = '生成缓存文件'
  // 覆盖缓存源文件
  await rewriteCache(cacheAbsPath, cache)
  spinner.stop()
  resultLog()
}
// 初始化所有图片文件目录
const initImgPaths = async (opt: inputTypes) => {
  const { imgPath, imgType, ignoreImagePath } = opt
  const imgPathType = imgPath!.map(v => `${v}/**/*.{${imgType!.join(',')}}`)
  const resolvedUnixFileImgPaths = imgPathType.map(async v => {
    const unixPaths = await globby(v, { onlyFiles: true })
    const absPaths = unixPaths.map(v => getAbsPath(v))
    return absPaths
  })
  const allImgAbsPathsArr = await Promise.all(resolvedUnixFileImgPaths)
  let allImgAbsPaths = allImgAbsPathsArr.reduce((pre, cur) => {
    return pre.concat(cur)
  })
  // 过滤不压缩的图片列表
  const ignoreMap: any = {}
  await filter(allImgAbsPaths, async (compress: string) => {
    for (let i = 0; i < ignoreImagePath!.length; i++) {
      const ignore = ignoreImagePath![i]
      if (!compress.includes(ignore)) continue
      const path = compress.split(ignore)[0] + ignore
      const isDic = await isDirectory(path)
      if (isDic) {
        ignoreMap[compress] = true
      }
    }
  })
  allImgAbsPaths = allImgAbsPaths.filter((v) => !ignoreMap[v])
  return allImgAbsPaths
}
// 初始化插件列表
const initPlugin = (pluginConfig: imageminPlugin, imgType: imgType) => {
  // imgType: ['jpg', 'png', 'svg', 'gif', 'jpeg', 'webp'],
  const hasJpg = imgType?.includes('jpg')
  const hasPng = imgType?.includes('png')
  const hasSvg = imgType?.includes('svg')
  const hasGif = imgType?.includes('gif')
  const hasJpeg = imgType?.includes('jpeg')
  const hasWebp = imgType?.includes('webp')

  const { gifsicle, svgo, pngquant, mozjpeg, optipng, webp } = pluginConfig
  if (hasGif && isTrue(gifsicle)) {
    plugins.push(imageminGifsicle(gifsicle))
  }
  if (hasPng && (isTrue(pngquant) || isTrue(optipng))) {
    plugins.push(imageminPngquant(pngquant))
    plugins.push(imageminOptpng(optipng))
  }
  if (hasSvg && isTrue(svgo)) {
    plugins.push(imageminSvgo(svgo))
  }
  if ((hasJpg || hasJpeg) && isTrue(mozjpeg)) {
    plugins.push(imageminMozjpeg(mozjpeg))
  }
  if ((hasWebp || hasJpeg) && isTrue(webp)) {
    plugins.push(imageminWebp(webp as WebpOptions))
  }
}
// 初始化缓存目录
const initCachePath = async () => {
  let cacheFilename = 'vv.imagemin.json'
  const cacheAbsPath = getAbsPath(cacheFilename)
  return cacheAbsPath
}
// 批量处理文件
const compressFiles = async (comressFilePaths: Array<any>): Promise<fileMap> => {
  time = Date.now()
  let resolvedFileMap: fileMap = []
  for (let i = 0; i < comressFilePaths.length; i++) {
    spinner.text = `图片压缩中，共有${comressFilePaths.length}张图片，正在压缩第${i + 1}张,压缩进度${((i + 1) / comressFilePaths.length * 100).toFixed(2)}%`
    let filePath = comressFilePaths[i]
    let content = await compressSingleFile(filePath)
    resolvedFileMap.push({ filePath, content })
  }
  return resolvedFileMap
}
// 处理单个文件
const compressSingleFile = async (singleAbsFilePath: string): Promise<Buffer> => {
  return new Promise(async (resolve) => {
    let buffer = fs.readFileSync(singleAbsFilePath)
    let content
    content = await imagemin.buffer(buffer, {
      plugins
    })
    const size = content.byteLength
    const oldSize = buffer.byteLength
    fileStat.set(singleAbsFilePath, {
      ...fileStat.get(singleAbsFilePath),
      size: size / 1024,
      oldSize: oldSize / 1024,
      ratio: size / oldSize - 1
    })
    resolve(content)
  })
}
// promise改写读取文件
const promiseReadFile = async (path: string): Promise<string> => {
  return new Promise((resolve) => {
    fs.readFile(path, 'utf-8', async (err, data) => {
      if (err) {
        if (err.errno == -4058 && err.code == 'ENOENT') {
          fs.writeFileSync(path, '{}')
        }
      }
      resolve(data || '{}')
    })
  })
}
// 输出结果
const resultLog = async () => {
  // spinner.stop()
  time = (Date.now() - time) / 1000
  const keyLengths = Array.from(fileStat.keys(), (name) => name.length)
  const valueLengths = Array.from(fileStat.values(), (value) => `${Math.floor(100 * value.ratio)}`.length)

  const maxKeyLength = Math.max(...keyLengths)
  const valueKeyLength = Math.max(...valueLengths)
  fileStat.forEach((value, name) => {
    let { ratio, size, oldSize } = value
    ratio = Math.floor(100 * ratio)
    const fr = `${ratio}`

    // 存在压缩之后反而变大的情况，这种情况不覆盖原图，所以这种情况显示0%
    const denseRatio = ratio > 0 ? chalk.green(`0%`) : ratio <= 0 ? chalk.green(`${fr}%`) : ''

    const sizeStr =
      ratio <= 0
        ? `${(oldSize * 1).toFixed(2)}kb / minify: ${(size * 1).toFixed(2)}kb`
        : `${(oldSize * 1).toFixed(2)}kb / minify: ${(oldSize * 1).toFixed(2)}kb`
    const newname = chalk.blueBright(name)
    const length = ' '.repeat(2 + maxKeyLength - name.length)
    const gray = chalk.gray(`${denseRatio} ${' '.repeat(valueKeyLength - fr.length)}`)
    const dim = chalk.dim(sizeStr)
    console.info('\n' + chalk.dim(newname + length + gray + ' ' + dim))
  })
  console.info('\n图片压缩总耗时', time + 's')
}
// 覆盖缓存源文件
const rewriteCache = async (cacheAbsPath: string, cache: any) => {
  fs.writeFileSync(cacheAbsPath, Buffer.from(JSON.stringify(cache)), {
    encoding: 'utf-8'
  })
}
// 覆盖图片源文件
const writeFiles = async (resolvedFileMap: fileMap, cache: any) => {
  if (resolvedFileMap.length) {
    resolvedFileMap.map(async (item) => {
      const { filePath, content } = item
      if (content) {
        if (fileStat.get(filePath).ratio < 0) {
          fs.writeFileSync(filePath, content)
          cache[filePath] = Date.now()
        } else {
          // 存在压缩之后反而变大的情况，这种情况不覆盖原图，但会记录到缓存表中，且记录的时间戳是旧文件自己的时间戳
          cache[filePath] = fileStat.get(filePath).lastEditTimes
        }
      }
    })
  }
}

export default viteImagemin
