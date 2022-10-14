import path from 'path'
import ts from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'
export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: path.resolve(__dirname, './dist/index.js'),
        format: 'es'
      }
    ],
    plugins: [
      ts()
    ]
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: path.resolve(__dirname, './dist/index.d.ts'),
        format: 'es'
      }
    ],
    plugins: [
      dts()
    ]
  }
]