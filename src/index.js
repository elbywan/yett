// Variables //
let blacklistedPatterns = window.SCRIPT_BLOCKER_BLACKLIST
const TYPE_ATTRIBUTE = 'javascript/blocked'

// Disables the checks
let disableBlocker = false
// Backup of the blacklisted script nodes
let blackListedScripts = []
// <head>
const head = document.getElementsByTagName('head')[0]

const needsToBeBlacklisted = (src, type) => (
    !disableBlocker &&
    (!type || type !== TYPE_ATTRIBUTE) &&
    blacklistedPatterns.some(entry => entry.test(src))
)

/* 1st part - setup a mutation observer to track DOM insertion */

const observer = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
        addedNodes.forEach(node => {
            // For each added script tag
            if(node.nodeType === 1 && node.tagName === 'SCRIPT') {
                const src = node.src || ''
                const type = node.type
                // If the src is inside the blacklist
                if(needsToBeBlacklisted(src, type)) {
                    // We backup a copy of the script node
                    blackListedScripts.push(node.cloneNode())

                    // Blocks inline script execution in Safari & Chrome
                    node.type = TYPE_ATTRIBUTE

                    // Safari has this additional event which prevents scripts from loading
                    node.addEventListener('beforeload', function (event) {
                        // Prevent only marked scripts from loading
                        if(node.getAttribute('type') === TYPE_ATTRIBUTE)
                            event.preventDefault()
                    })

                    // Firefox has this additional event which prevents scripts from beeing executed
                    node.addEventListener('beforescriptexecute', function (event) {
                        // Prevent only marked scripts from executing
                        if(node.getAttribute('type') === TYPE_ATTRIBUTE)
                            event.preventDefault()
                    })

                    // Remove the node from the DOM
                    node.parentElement.removeChild(node)
                    // console.log('Blacklisted scripts', blackListedScripts)
                }
            }
        })
    })
})

// Starts the monitoring
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
})

/* 2nd part - Monkey patch the createElement method to prevent dynamic scripts from executing */

const originalDescriptors = Object.getOwnPropertyDescriptors(HTMLScriptElement.prototype)
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
                if(needsToBeBlacklisted(value, scriptElt.type)) {
                    scriptElt.type = TYPE_ATTRIBUTE
                }
                return originalDescriptors.src.set.call(this, value)
            }
        },
        'type': {
            set(value) {
                return originalDescriptors.type.set.call(
                    this,
                    needsToBeBlacklisted(scriptElt.src, scriptElt.type) ?
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
            HTMLScriptElement.protytope.setAttribute.call(scriptElt, name, value)
    }

    return scriptElt
}

/* Expose a function that resumes the blacklisted scripts execution. */

const unblockCheck = function(script) {
    const src = script.getAttribute('src')
    return (
        disableBlocker ||
        blacklistedPatterns.every(entry => !entry.test(src))
    )
}

export const unblock = function(...scriptUrls) {
    if(disableBlocker)
        return

    observer.disconnect()

    if(!scriptUrls || scriptUrls.length < 1) {
        disableBlocker = true
    } else {
        blacklistedPatterns = blacklistedPatterns.filter(pattern =>
            scriptUrls.every(url => !pattern.test(url))
        )
    }

    // Parse existing script tags with a marked type
    Array.from(document.getElementsByTagName('script')).forEach(script => {
        if(script.getAttribute('type') === TYPE_ATTRIBUTE && unblockCheck(script)) {
            script.type = 'application/javascript'
            blackListedScripts.push(script)
            script.parentElement.removeChild(script)
        }
    })
    /* Blacklisted */
    blackListedScripts = blackListedScripts.reduce((acc, script) => {
        if(unblockCheck(script)) {
            const scriptNode = document.createElement('script')
            scriptNode.setAttribute('src', script.src)
            head.appendChild(scriptNode)
            return acc
        }
        return [...acc, script]
    }, [])
    blackListedScripts.forEach(script => {
        if(unblockCheck(script)) {
            const scriptNode = document.createElement('script')
            scriptNode.setAttribute('src', script.src)
            head.appendChild(scriptNode)
        }
    })
}