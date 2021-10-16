import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel'

export default {
    input: 'src/index.js',
    output: {
      file: 'dist/yett.min.js',
      format: 'umd',
      name: 'yett',
      sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'bundled'
        }),
        terser()
    ]
}
