import { uglify } from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import babel from 'rollup-plugin-babel'

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
            exclude: 'node_modules/**'
        }),
        uglify({}, minify)
    ]
}
