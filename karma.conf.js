const fileName = process.env.WHITELIST ? 'whitelist' : 'blacklist'
const customContextFile = `test/index-${fileName}.html`

console.log('karma context:', customContextFile)

module.exports = function(config) {
    config.set({
      files: ['test/**/*.js'],
      frameworks: ['mocha', 'chai'],
      plugins: [
        require('karma-mocha'),
        require('karma-chai'),
        require('karma-chrome-launcher'),
        require('karma-firefox-launcher'),
        require('karma-safari-launcher'),
      ],
      reporters: ['progress'],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      browsers: ['ChromeHeadless', 'FirefoxHeadless', 'Safari'],
      autoWatch: false,
      concurrency: 1,
      customLaunchers: {
        FirefoxHeadless: {
          base: 'Firefox',
          flags: [ '-headless' ],
        }
      },
      files: [
        { pattern: 'test/scripts/yett.min.js',  included: false },
        { pattern: 'test/scripts/not-blocked.js',  included: false },
        { pattern: 'test/scripts/script.js',  included: false },
        { pattern: 'test/scripts/script-blocked.js',  included: false },
        { pattern: 'test/scripts/dynamic.js',  included: false },
        'test/test.js'
      ],
      customContextFile,
      clearContext: false,
    })
}