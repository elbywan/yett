import { uglify } from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
    input: 'src/index.js',
    output: {
      file: 'dist/script-blocker.min.js',
      format: 'umd',
      name: 'scriptBlocker',
      sourcemap: true
    },
    plugins: [
        uglify({}, minify)
    ]
}