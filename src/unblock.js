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
export const unblock = function(...scriptUrls) {

    if(scriptUrls.length < 1) {
        patterns.blacklist = []
        patterns.whitelist = []
    } else {
        if(patterns.blacklist) {
            patterns.blacklist = patterns.blacklist.filter(pattern =>
                scriptUrls.every(url => !pattern.test(url))
            )
        }
        if(patterns.whitelist) {
            patterns.whitelist = [
                ...patterns.whitelist,
                ...scriptUrls
                    .map(url => {
                        const escapedUrl = url.replace(URL_REPLACER_REGEXP, '\\$&')
                        const permissiveRegexp = '.*' + escapedUrl + '.*'
                        if(!patterns.whitelist.find(p => p.toString() === permissiveRegexp.toString())) {
                            return new RegExp(permissiveRegexp)
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
            script.type = 'application/javascript'
            backupScripts.blacklisted.push(script)
            script.parentElement.removeChild(script)
        }
    }

    // Exclude 'whitelisted' scripts from the blacklist and append them to <head>
    let indexOffset = 0;
    [...backupScripts.blacklisted].forEach((script, index) => {
        if(willBeUnblocked(script)) {
            const scriptNode = document.createElement('script')
            scriptNode.setAttribute('src', script.src)
            scriptNode.setAttribute('type', 'application/javascript')
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