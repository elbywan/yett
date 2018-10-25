import {
    patterns,
    backupScripts,
    TYPE_ATTRIBUTE,
    patternsObj,
    jsonStringify
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
        patterns.whitelist = [ 'type/javascript\\/blocked/' ]
    } else {
        if(patterns.blacklist instanceof Array) {
            patterns.blacklist = patterns.blacklist.filter(pattern => 
                scriptUrls.every(url => {
                    if (url == pattern) return false   
                    return typeof url == 'string' ? !testPattern(pattern,url): false
                }))
            // patterns.blacklist = patterns.blacklist.filter(pattern =>
            //     scriptUrls.every(url => (typeof url == 'string' ? !testPattern(pattern,url): false ))
            // )
        }
        if (!patterns.whitelist) patterns.whitelist = []
        if(patterns.whitelist instanceof Array) {
            patterns.whitelist = [
                ...patterns.whitelist,
                ...scriptUrls
                    .map(url => {
                        if ( url === true)
                            url = new RegExp('^$')
                        if (typeof url == 'string'){
                            if ( url == '' || url == '//'){
                                url = new RegExp('^$')
                        }else if (!( !url.startsWith('http') && url.slice(-1) == '/' && (url.replace(/\\/g,'').match(/\//g) || []).length == 2)){
                                const escapedUrl = url.replace(URL_REPLACER_REGEXP, '\\$&')
                                url = '/.*' + escapedUrl + '.*/'
                            }
                        }
                        if(!patterns.whitelist.find(p => p.toString() === url.toString())) {
                            return url
                        }                        
                        return null
                    })
                    .filter(Boolean)
            ]
        }
    }

    // Parse existing script tags with a marked type
    // We must delete the scripts to make the browser execute it again
    const tags = document.querySelectorAll(`script[type="${TYPE_ATTRIBUTE}"]`)
    for(let i = 0; i < tags.length; i++) {
        const script = tags[i]
        if(willBeUnblocked(script)) {
            script.setAttribute('type', 'application/javascript')
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
            if (script.type && script.type === TYPE_ATTRIBUTE && script.backup_type)
                script.setAttribute('type', script.backup_type)
            if(script.type === 'javascript/blocked')
                script.setAttribute('type', 'application/javascript')
            if(script.tagName == 'SCRIPT' && script.src){
                let s = document.createElement('SCRIPT')
                s.setAttribute('src', script.src)
                s.setAttribute('type', 'application/javascript')
                script = s
            }
            parent.appendChild(script)
            backupScripts.blacklisted.splice(index - indexOffset, 1)
            indexOffset++
        }
    })    

    //Store filters for next session, with patch to support Regex
    window.localStorage.YETT_BLACKLIST = jsonStringify( patterns.blacklist)
    window.localStorage.YETT_WHITELIST = jsonStringify( patterns.whitelist)
    // document.head.appendChild(script)
    // Disconnect the observer if the blacklist is empty for performance reasons
    if(!patterns.blacklist || (patterns.blacklist && patterns.blacklist.length < 1)) {
        observer.disconnect()
    }
}


export const block = function(...scriptUrls) {

    if(patterns.whitelist instanceof Array) {
        patterns.whitelist = patterns.whitelist.filter(pattern => 
            scriptUrls.every(url => {
                if (url == pattern) return false   
                return typeof url == 'string' ? !testPattern(pattern,url): false
            }))
        // patterns.blacklist = patterns.blacklist.filter(pattern =>
        //     scriptUrls.every(url => (typeof url == 'string' ? !testPattern(pattern,url): false ))
        // )
    }
    if (!patterns.blacklist) patterns.blacklist = []
    patterns.blacklist = [
        ...patterns.blacklist,
        ...scriptUrls
            .map(url => {
                if (typeof url == 'string'){
                    if ( url == '' || url == '//'){
                        url = new RegExp('^$')
                }else if (!( !url.startsWith('http') && url.slice(-1) == '/' && (url.replace(/\\/g,'').match(/\//g) || []).length == 2)){
                        const escapedUrl = url.replace(URL_REPLACER_REGEXP, '\\$&')
                        url = '/.*' + escapedUrl + '.*/'
                    }
                }                
                if(!patterns.blacklist.find(p => p.toString() === url.toString())) {
                    return url
                }        
                return null         
            }).filter(Boolean)
    ]
    window.localStorage.YETT_BLACKLIST = jsonStringify( patterns.blacklist)
    window.localStorage.YETT_WHITELIST = jsonStringify( patterns.whitelist)    
}