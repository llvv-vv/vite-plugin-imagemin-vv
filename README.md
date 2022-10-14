# vite-plugin-imagemin-vv

[![npm][npm-img]][npm-url]

**中文** | [English](./README.en.md)

## 介绍

这是一个基于 imagemin 进行开发的 vite 插件，可以在 build 的时候自动获取指定路径下的指定类型的图片文件并压缩

## 安装

```
yarn add vite-plugin-imagemin-vv -D
```

或者

```
npm i vite-plugin-imagemin-vv -D
```

## 使用方式

```
import viteImagemin from 'vite-plugin-imagemin-vv'
...
export default defineConfig({
  plugins: [
    viteImagemin()
  ]
})
```

## 配置

| 参数                  | 类型          | 默认值                               | 说明                                                                 |
| --------------------- | ------------- | ------------------------------------ | -------------------------------------------------------------------- |
| imgPath               | Array<string> | ['src/assets']                       | 图片路径                                                             |
| imgType               | Array<string> | ['jpg', 'png', 'svg', 'gif', 'jpeg'] | 需要转换的图片类型                                                   |
| open                  | boolean       | true                                 | 是否开启压缩                                                         |
| ignoreImagePath       | Array<string> | ['']                                 | 比如需要跳过`src/assets/config`<br/>文件夹下的图片，设置`['config']` |
| pluginConfig          | -             | ↓                                    | ↓                                                                    |
| pluginConfig.gifsicle | object        | ↓                                    | 参考 [官方文档](https://github.com/imagemin/imagemin-gifsicle)       |
| pluginConfig.optipng  | object        | ↓                                    | 参考 [官方文档](https://github.com/imagemin/imagemin-optipng)        |
| pluginConfig.mozjpeg  | object        | ↓                                    | 参考 [官方文档](https://github.com/imagemin/imagemin-mozjpeg)        |
| pluginConfig.pngquant | object        | ↓                                    | 参考 [官方文档](https://github.com/imagemin/imagemin-pngquant)       |
| pluginConfig.svgo     | object        | ↓                                    | 参考 [官方文档](https://github.com/svg/svgo/#what-it-can-do)         |
| pluginConfig.webp     | object        | ↓                                    | 参考 [官方文档](https://github.com/imagemin/imagemin-webp)           |

```javascript
viteImagemin({
  imgPath: ["src/assets"],
  imgType: ["jpg", "png", "svg", "gif", "jpeg"],
  open: true,
  ignoreImagePath: [""],
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
          name: "preset-default",
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
    webp: false,
  },
});
```

## 注意事项

`imagemin` 包含 `pngquant` 和 `mozjpeg` 等知名库，需要下载二进制文件。中国国内开发者因为网络原因大概率会导致安装失败，解决方式如下。

1、使用 `resolutions` 和 `bin-wrapper-china`（推荐）

bin-wrapper-china：https://github.com/best-shot/bin-wrapper-china

blog：http://t.zoukankan.com/Chary-p-13862863.html

resolutions：https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md

```
// package.json
{
  "resolutions": {
    "bin-wrapper": "npm:bin-wrapper-china"
  }
}
```

2、使用 `cnpm`（不推荐）

```
cnpm i vite-plugin-imagemin-vv -D
```

## License

MIT

## 最后

第一次开发东西传 github，不知道好不好用，有问题请联系

[npm-img]: https://img.shields.io/npm/v/vite-plugin-imagemin-vv.svg
[npm-url]: https://npmjs.com/package/vite-plugin-imagemin-vv
