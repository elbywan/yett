// Variables //
let blacklistedPatterns = window.YETT_BLACKLIST
let whitelistedPatterns = window.YETT_WHITELIST
const TYPE_ATTRIBUTE = 'javascript/blocked'

// Backup of the blacklisted script nodes
let blackListedScripts = []

const isOnBlacklist = (src, type) => (
    src &&
    (!type || type !== TYPE_ATTRIBUTE) &&
    (
        (!blacklistedPatterns || blacklistedPatterns.some(pattern => pattern.test(src))) &&
        (!whitelistedPatterns || whitelistedPatterns.every(pattern => !pattern.test(src)))
    )
)

/* 1st part - setup a mutation observer to track DOM insertion */

const observer = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
        for(let i = 0; i < addedNodes.length; i++) {
            const node = addedNodes[i]
            // For each added script tag
            if(node.nodeType === 1 && node.tagName === 'SCRIPT') {
                const src = node.src
                const type = node.type
                // If the src is inside the blacklist and is not inside the whitelist
                if(isOnBlacklist(src, type)) {
                    // We backup a copy of the script node
                    blackListedScripts.push(node.cloneNode())

                    // Blocks inline script execution in Safari & Chrome
                    node.type = TYPE_ATTRIBUTE

                    // Firefox has this additional event which prevents scripts from beeing executed
                    const beforeScriptExecuteListener = function (event) {
                        // Prevent only marked scripts from executing
                        if(node.getAttribute('type') === TYPE_ATTRIBUTE)
                            event.preventDefault()
                        node.removeEventListener('beforescriptexecute', beforeScriptExecuteListener)
                    }
                    node.addEventListener('beforescriptexecute', beforeScriptExecuteListener)

                    // Remove the node from the DOM
                    node.parentElement.removeChild(node)
                }
            }
        }
    })
})

// Starts the monitoring
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
})

/* 2nd part - Monkey patch the createElement method to prevent dynamic scripts from executing */

const originalDescriptors = {
    src: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
    type: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'type')
}
const createElementBackup = document.createElement

document.createElement = function(...args) {
    // If this is not a script tag, bypass
    if(args[0].toLowerCase() !== 'script')
        return createElementBackup.bind(document)(...args)

    const scriptElt = createElementBackup.bind(document)(...args)

    // Use the prototype descriptors
    Object.defineProperties(scriptElt, {
        'src': {
            get() {
                return originalDescriptors.src.get.call(this)
            },
            set(value) {
                if(isOnBlacklist(value, scriptElt.type)) {
                    scriptElt.type = TYPE_ATTRIBUTE
                }
                return originalDescriptors.src.set.call(this, value)
            }
        },
        'type': {
            set(value) {
                return originalDescriptors.type.set.call(
                    this,
                    isOnBlacklist(scriptElt.src, scriptElt.type) ?
                        TYPE_ATTRIBUTE :
                        value
                )
            }
        }
    })

    // Monkey patch the setAttribute function so that the setter is called instead
    scriptElt.setAttribute = function(name, value) {
        if(name === 'type' || name === 'src')
            scriptElt[name] = value
        else
            HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value)
    }

    return scriptElt
}

const unblockCheck = function(script) {
    const src = script.getAttribute('src')
    return (
        (blacklistedPatterns && blacklistedPatterns.every(entry => !entry.test(src))) ||
        (whitelistedPatterns && whitelistedPatterns.some(entry => entry.test(src)))
    )
}

// Unblocks all (or a selection of) blacklisted scripts.
export const unblock = function(...scriptUrls) {

    if(scriptUrls.length < 1) {
        blacklistedPatterns = []
        whitelistedPatterns = []
    } else {
        if(blacklistedPatterns) {
            blacklistedPatterns = blacklistedPatterns.filter(pattern =>
                scriptUrls.every(url => !pattern.test(url))
            )
        }
        if(whitelistedPatterns) {
            whitelistedPatterns = [
                ...whitelistedPatterns,
                ...scriptUrls
                    .map(url => {
                        const escapedUrl = url.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                        const permissiveRegexp = '.*' + escapedUrl + '.*'
                        if(!whitelistedPatterns.find(p => p.toString() === permissiveRegexp.toString())) {
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
    for(let i = 0; i < tags.length; i++) {
        const script = tags[i]
        if(unblockCheck(script)) {
            script.type = 'application/javascript'
            blackListedScripts.push(script)
            script.parentElement.removeChild(script)
        }
    }

    // Exclude 'whitelisted' scripts from the blacklist and append them to <head>
    blackListedScripts = blackListedScripts.reduce((acc, script) => {
        if(unblockCheck(script)) {
            const scriptNode = document.createElement('script')
            scriptNode.setAttribute('src', script.src)
            scriptNode.setAttribute('type', 'application/javascript')
            document.head.appendChild(scriptNode)
            return acc
        }
        return [...acc, script]
    }, [])

    // Disconnect the observer if the blacklist is empty for performance reasons
    if(blacklistedPatterns && blacklistedPatterns.length < 1) {
        observer.disconnect()
    }
}
