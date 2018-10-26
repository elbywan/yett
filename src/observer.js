import { backupScripts, blockNode, TYPE_ATTRIBUTE, blockNodeNoBackup } from './variables'
import { isOnBlacklist } from './checks'

// Setup a mutation observer to track DOM insertion
export const observer = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
        for(let i = 0; i < addedNodes.length; i++) {
            const node = addedNodes[i]
            // For each added script tag
            if(node.nodeType === 1 ){
                const blockingType = isOnBlacklist(node)                 
                if (node.tagName === 'SCRIPT' && blockingType) {
                    // If the src is inside the blacklist and is not inside the whitelist
                        // We backup a copy of the script node
                        backupScripts.blacklisted.push([node.cloneNode(true),node.parentElement])
                        blockNodeNoBackup(node,blockingType)
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
                        
                        node.parentElement.removeChild(node)
                }
                else if (blockingType) {
                    // Remove the node from the DOM
                    blockNode(node,blockingType)
                }
                // if(node.nodeType === 1 && node.tagName === 'IFRAME' && TYPE_SANDBOX !== false) {
                //     const src = node.src
                //     // If the src is inside the blacklist and is not inside the whitelist
                //     if(isOnBlacklist(src)) {
                //         // We backup a copy of the script node
                //         //backupIframes.blacklisted.push(node.cloneNode(true))

                //         if (TYPE_SANDBOX === 'remove'){
                //             // Remove the node from the DOM
                //             node.parentElement.removeChild(node)
                //         }else{
                //             node.sandbox = TYPE_SANDBOX
                //         }
                //     }
                // }  
            }          
        }
    })
})

// Starts the monitoring
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
})