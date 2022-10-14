# vite-plugin-imagemin-vv

[![npm][npm-img]][npm-url]

[中文](./README.md) | **English**

## Description

A vite plugin developed based on imagemin, which can automatically obtain the specified type of image files under the specified path and compress them when `run build`.

## Install

```
yarn add vite-plugin-imagemin-vv -D
```

or

```
npm i vite-plugin-imagemin-vv -D
```

## Usage

```
import viteImagemin from 'vite-plugin-imagemin-vv'
...
export default defineConfig({
  plugins: [
    viteImagemin()
  ]
})
```

## Config

| params                | type          | default                              | description                                                      |
| --------------------- | ------------- | ------------------------------------ | ---------------------------------------------------------------- |
| imgPath               | Array<string> | ['src/assets']                       | List of image files                                              |
| imgType               | Array<string> | ['jpg', 'png', 'svg', 'gif', 'jpeg'] | List of image types to be compressed                             |
| open                  | boolean       | true                                 | set false will skip this plugin                                  |
| ignoreImagePath       | Array<string> | ['']                                 | if you want to skip`src/assets/config`<br/>just set `['config']` |
| pluginConfig          | object        | -                                    | ↓                                                                |
| pluginConfig.gifsicle | object        | ↓                                    | see [Official](https://github.com/imagemin/imagemin-gifsicle)    |
| pluginConfig.optipng  | object        | ↓                                    | see [Official](https://github.com/imagemin/imagemin-optipng)     |
| pluginConfig.mozjpeg  | object        | ↓                                    | see [Official](https://github.com/imagemin/imagemin-mozjpeg)     |
| pluginConfig.pngquant | object        | ↓                                    | see [Official](https://github.com/imagemin/imagemin-pngquant)    |
| pluginConfig.svgo     | object↓       | ↓                                    | see [Official](https://github.com/svg/svgo/#what-it-can-do)      |
| pluginConfig.webp     | object↓       | ↓                                    | see [Official](https://github.com/imagemin/imagemin-webp)        |

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

## Notes

`imagemin` contains well-known libs such as `pngquant` and `mozjpeg` , it need to download binary files.Chinese developers may fail to install due to some network problems. There are some solutions.

1、use `resolutions` and `bin-wrapper-china`（recommend）

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

2、use `cnpm`（not recommend）

```
cnpm i vite-plugin-imagemin-vv -D
```

## License

MIT

## End

First time to push something to github. I don't know whether it's easy to use. If you have any questions, please mail me.

[npm-img]: https://img.shields.io/npm/v/vite-plugin-imagemin-vv.svg
[npm-url]: https://npmjs.com/package/vite-plugin-imagemin-vv
