import {
    patterns,
    backupScripts,
    TYPE_ATTRIBUTE
} from './variables'

import {
    willBeUnblocked
} from './checks'

import {
    observer
} from './observer'

const URL_REPLACER_REGEXP = new RegExp('[|\\{}()[\\]^$+*?.]', 'g')

// Unblocks all (or a selection of) blockListed scripts.
export const unblock = function(...scriptUrlsOrRegexes) {
    if(scriptUrlsOrRegexes.length < 1) {
        patterns.blockList = []
        patterns.allowList = []
    } else {
        if(patterns.blockList) {
            patterns.blockList = patterns.blockList.filter(pattern => (
                scriptUrlsOrRegexes.every(urlOrRegexp => {
                    if(typeof urlOrRegexp === 'string')
                        return !pattern.test(urlOrRegexp)
                    else if(urlOrRegexp instanceof RegExp)
                        return pattern.toString() !== urlOrRegexp.toString()
                })
            ))
        }
        if(patterns.allowList) {
            patterns.allowList = [
                ...patterns.allowList,
                ...scriptUrlsOrRegexes
                    .map(urlOrRegexp => {
                        if(typeof urlOrRegexp === 'string') {
                            const escapedUrl = urlOrRegexp.replace(URL_REPLACER_REGEXP, '\\$&')
                            const permissiveRegexp = '.*' + escapedUrl + '.*'
                            if(patterns.allowList.every(p => p.toString() !== permissiveRegexp.toString())) {
                                return new RegExp(permissiveRegexp)
                            }
                        } else if(urlOrRegexp instanceof RegExp) {
                            if(patterns.allowList.every(p => p.toString() !== urlOrRegexp.toString())) {
                                return urlOrRegexp
                            }
                        }
                        return null
                    })
                    .filter(Boolean)
            ]
        }
    }


    // Parse existing script tags with a marked type
    const tags = document.querySelectorAll(`script[type="${TYPE_ATTRIBUTE}"]`)
    for(let i = 0; i < tags.length; i++) {
        const script = tags[i]
        if(willBeUnblocked(script)) {
            backupScripts.blockListed.push([script, 'application/javascript'])
            script.parentElement.removeChild(script)
        }
    }

    // Exclude 'allowListed' scripts from the blockList and append them to <head>
    let indexOffset = 0;
    [...backupScripts.blockListed].forEach(([script, type], index) => {
        if(willBeUnblocked(script)) {
            const scriptNode = document.createElement('script')
            scriptNode.setAttribute('src', script.src)
            scriptNode.setAttribute('type', type || 'application/javascript')
            for(let key in script) {
                if(key.startsWith("on")) {
                    scriptNode[key] = script[key]
                }
            }
            document.head.appendChild(scriptNode)
            backupScripts.blockListed.splice(index - indexOffset, 1)
            indexOffset++
        }
    })

    // Disconnect the observer if the blockList is empty for performance reasons
    if(patterns.blockList && patterns.blockList.length < 1) {
        observer.disconnect()
    }
}