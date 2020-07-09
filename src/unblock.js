import {
    patterns,
    backupElements,
    TYPE_ATTRIBUTE,
    HIDDEN_SRC_ATTRIBUTE
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


    // Parse existing tags with a marked type
    const tags = document.querySelectorAll(`script[type="${TYPE_ATTRIBUTE}"], *[${HIDDEN_SRC_ATTRIBUTE}]`)
    for(let i = 0; i < tags.length; i++) {
        const elem = tags[i]
        if(willBeUnblocked(elem)) {
            backupElements.blacklisted.push([elem, 'application/javascript'])
            elem.parentElement.removeChild(elem)
        }
    }

    // Exclude 'whitelisted' scripts from the blacklist and append them to <head>
    let indexOffset = 0;
    [...backupElements.blacklisted].forEach(([elem, type], index) => {
        if(willBeUnblocked(elem)) {
            const tagName = elem.tagName.toLowerCase();
            const elementNode = document.createElement(tagName)
            const stashedSrc = elem.getAttribute(HIDDEN_SRC_ATTRIBUTE);
            if (stashedSrc) {
                console.log('Unstashing', stashedSrc);
                elementNode.setAttribute('src', stashedSrc)
            } else {
                console.log('resetting', elem.src);
                elementNode.setAttribute('type', type || 'application/javascript')
                elementNode.setAttribute('src', elem.src)
            }

            for(let key in elem) {
                if(key.startsWith("on")) {
                    elementNode[key] = elem[key]
                }
            }
            document.head.appendChild(elementNode)
            backupElements.blacklisted.splice(index - indexOffset, 1)
            indexOffset++
        }
    })

    // Disconnect the observer if the blacklist is empty for performance reasons
    if(patterns.blacklist && patterns.blacklist.length < 1) {
        observer.disconnect()
    }
}