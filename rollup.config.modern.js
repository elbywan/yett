import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel'

export default {
    input: 'src/index.js',
    output: {
      file: 'dist/yett.min.modern.js',
      format: 'umd',
      name: 'yett',
      sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'bundled',
            presets: [
                [
                    "@babel/env",
                    {
                        "modules": "auto",
                        "targets": {
                            "esmodules": true
                        }
                    }
                ]
            ]
        }),
        terser()
    ]
}
