const scriptDidExecute = scriptName => document.getElementById(scriptName)
const assertThatScriptDidExecute = scriptName => assert(scriptDidExecute(scriptName), `${scriptName}.js has not been executed`)
const assertThatScriptDidNotExecute = scriptName => assert(!scriptDidExecute(scriptName), `${scriptName}.js has been executed`)

function getBrowser() {
    const browsers = ['MSIE', 'Firefox', 'Safari', 'Chrome', 'Opera']
    const userAgent = navigator.userAgent

    for (let i = browsers.length - 1; i >= 0; i--) {
        if(userAgent.indexOf(browsers[i]) >= 0)
            return browsers[i]
    }
}

describe('Yett', () => {
    it('should attach to the window object', () => {
        assert(!!window.yett, 'window.yett is not defined')
        assert(
            !!window.YETT_BLOCK_LIST || !!window.YETT_ALLOW_LIST,
            'window.YETT_BLOCK_LIST or window.YETT_ALLOW_LIST is not defined'
        )
    })
    it('should not block unwanted scripts', () => {
        assertThatScriptDidExecute('not-blocked')
    })
    it('should block blockListed scripts', () => {
        assertThatScriptDidNotExecute('script')
        assertThatScriptDidNotExecute('dynamic')
        assertThatScriptDidNotExecute('script-blocked')
    })
    it('should not load scripts that have the javascript/blocked attribute', () => {
        assert(
            !['Chrome', 'Firefox'].includes(getBrowser()) ||
            !performance.getEntriesByName('http://localhost:9876/base/test/scripts/script-blocked.js').length,
            'script-blocked script has been downloaded'
        )
    })
    it('should unblock scripts', async function() {
        this.timeout(10000)

        window.yett.unblock(/script\.js$/)
        await new Promise(resolve => setTimeout(resolve, 1000))
        assertThatScriptDidExecute('script')
        assertThatScriptDidNotExecute('dynamic')
        assertThatScriptDidNotExecute('script-blocked')

        window.yett.unblock('dynamic.js')
        await new Promise(resolve => setTimeout(resolve, 1000))
        assertThatScriptDidExecute('script')
        assertThatScriptDidExecute('dynamic')
        assertThatScriptDidNotExecute('script-blocked')

        window.yett.unblock()
        await new Promise(resolve => setTimeout(resolve, 1000))
        assertThatScriptDidExecute('script')
        assertThatScriptDidExecute('dynamic')
        assertThatScriptDidExecute('script-blocked')
    })
})