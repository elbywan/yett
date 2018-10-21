import {
    patterns,
    backupScripts,
    TYPE_ATTRIBUTE,
    patternsObj
} from './variables'

import {
    willBeUnblocked,
    testPattern
} from './checks'

import {
    observer
} from './observer'

const URL_REPLACER_REGEXP = new RegExp('[|\\{}()[\\]^$+*?.]', 'g')

export const unblockId = function(...scriptIds) {
    scriptIds.forEach((e) => {
        if (patternsObj.blacklist instanceof Object){
            try{
                unblock(patternsObj.blacklist[e]);
            }catch(_){  /* do nothing*/     }
        }
        if (patternsObj.whitelist instanceof Object){
            try{
                unblock(patternsObj.whitelist[e]);
            }catch(_){ /* do nothing*/  }
        }        
    });
}

// Unblocks all (or a selection of) blacklisted scripts.
export const unblock = function(...scriptUrls) {

    if(scriptUrls.length < 1) {
        patterns.blacklist = []
        patterns.whitelist = []
    } else {
        if(patterns.blacklist instanceof Array) {
            patterns.blacklist = patterns.blacklist.filter(pattern =>
                scriptUrls.every(url => !testPattern(pattern,url))
            )
        }
        if(patterns.whitelist instanceof Array) {
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
            backupScripts.blacklisted.push([script,script.parentElement])
            script.parentElement.removeChild(script)
        }
    }

    // Exclude 'whitelisted' scripts from the blacklist and append them to <head>
    let indexOffset = 0;
    [...backupScripts.blacklisted].forEach((arr, index) => {
        let script = arr[0]
        let parent = arr[1]
        if(willBeUnblocked(script)) {
            if (script.type && script.type === TYPE_ATTRIBUTE)
                script.type = 'application/javascript'
            parent.appendChild(script)
            backupScripts.blacklisted.splice(index - indexOffset, 1)
            indexOffset++
        }
    })    

    // Disconnect the observer if the blacklist is empty for performance reasons
    if(patterns.blacklist && patterns.blacklist.length < 1) {
        observer.disconnect()
    }
}