// Variables //
let blacklistedPatterns = window.SCRIPT_BLOCKER_BLACKLIST
const TYPE_ATTRIBUTE = 'javascript/blocked'

// Disables the checks
let disableBlocker = false
// Backup of the blacklisted script nodes
let blackListedScripts = []

const needsToBeBlacklisted = (src, type) => (
    !disableBlocker &&
    (!type || type !== TYPE_ATTRIBUTE) &&
    blacklistedPatterns.some(pattern => pattern.test(src))
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
        })
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
    const tags = document.querySelectorAll(`script[type="${TYPE_ATTRIBUTE}"]`)
    for(let i = 0; i < tags.length; i++) {
        const script = tags[i]
        if(unblockCheck(script)) {
            script.type = 'application/javascript'
            blackListedScripts.push(script)
            script.parentElement.removeChild(script)
        }
    }
    // Array.from(document.querySelectorAll(`script[type="${TYPE_ATTRIBUTE}"]`)).forEach(script => {
    //     if(unblockCheck(script)) {
    //         script.type = 'application/javascript'
    //         blackListedScripts.push(script)
    //         script.parentElement.removeChild(script)
    //     }
    // })

    // Exclude 'whitelisted' scripts from the blacklist and append them to <head>
    blackListedScripts = blackListedScripts.reduce((acc, script) => {
        if(unblockCheck(script)) {
            const scriptNode = document.createElement('script')
            scriptNode.setAttribute('src', script.src)
            document.head.appendChild(scriptNode)
            return acc
        }
        return [...acc, script]
    }, [])
}