import fs from 'fs'
import path from 'path'
import type { inputTypes } from './types'
// 是否存在
export const isTrue = (params: false | object | undefined): boolean => {
  return !!params && JSON.stringify(params) != "{}" && typeof params == 'object' && params != undefined
}
// 是否为文件夹
export const isDirectory = async (path: string) => {
  return new Promise((resolve) => {
    fs.stat(path, (err, stat) => {
      if (err || !stat || !stat.isDirectory()) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}
// 获取文件绝对路径
export const getAbsPath = (relativePath: string) => {
  const cwd = process.cwd()
  const absPath = path.resolve(cwd, relativePath)
  return absPath
}
// 用map模拟filter
export const filter = async (filePaths: Array<string>, callback: Function) => {
  const fail: symbol = Symbol()
  let newArr = filePaths.map(async (item) => ((await callback(item)) ? item : fail))
  let result = await Promise.all(newArr)
  return result.filter((i) => i !== fail)
}
// 读取最后一次修改文件时的时间戳(以毫秒为单位)
export const fsStat = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats.mtimeMs)
      }
    })
  })
}

export const initDefaultOpt = (opt: inputTypes | undefined) => {
  let defaultOpt = {
    imgPath: ['src/assets'],
    imgType: ['jpg', 'png', 'svg', 'gif', 'jpeg'],
    open: true,
    ignoreImagePath: [''],
    pluginConfig: {
      gifsicle: {
        optimizationLevel: 7,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 50,
      },
      pngquant: {
        quality: [0.7, 0.8],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                inlineStyles: {
                  onlyMatchedOnce: false,
                },
              },
            },
          },
        ],
      },
      webp: false
    }
  }
  if (opt == undefined) {
    return defaultOpt as inputTypes
  }
  Object.assign(defaultOpt, opt)
  return defaultOpt as inputTypes
}
