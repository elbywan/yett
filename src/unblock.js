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

// Unblocks all (or a selection of) blacklisted scripts.
export const unblock = function(...scriptUrlsOrRegexes) {
    if(scriptUrlsOrRegexes.length < 1) {
        patterns.blacklist = []
        patterns.whitelist = []
    } else {
        if(patterns.blacklist) {
            patterns.blacklist = patterns.blacklist.filter(pattern => (
                scriptUrlsOrRegexes.every(urlOrRegexp => {
                    if(typeof urlOrRegexp === 'string')
                        return !pattern.test(urlOrRegexp)
                    else if(urlOrRegexp instanceof RegExp)
                        return pattern.toString() !== urlOrRegexp.toString()
                })
            ))
        }
        if(patterns.whitelist) {
            patterns.whitelist = [
                ...patterns.whitelist,
                ...scriptUrlsOrRegexes
                    .map(urlOrRegexp => {
                        if(typeof urlOrRegexp === 'string') {
                            const escapedUrl = urlOrRegexp.replace(URL_REPLACER_REGEXP, '\\$&')
                            const permissiveRegexp = '.*' + escapedUrl + '.*'
                            if(patterns.whitelist.every(p => p.toString() !== permissiveRegexp.toString())) {
                                return new RegExp(permissiveRegexp)
                            }
                        } else if(urlOrRegexp instanceof RegExp) {
                            if(patterns.whitelist.every(p => p.toString() !== urlOrRegexp.toString())) {
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
            backupScripts.blacklisted.push([script, 'application/javascript'])
            script.parentElement.removeChild(script)
        }
    }

    // Exclude 'whitelisted' scripts from the blacklist and append them to <head>
    let indexOffset = 0;
    [...backupScripts.blacklisted].forEach(([script, type], index) => {
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
            backupScripts.blacklisted.splice(index - indexOffset, 1)
            indexOffset++
        }
    })

    // Disconnect the observer if the blacklist is empty for performance reasons
    if(patterns.blacklist && patterns.blacklist.length < 1) {
        observer.disconnect()
    }
}