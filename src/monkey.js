import { TYPE_ATTRIBUTE,TYPE_SANDBOX } from './variables'
import { isOnBlacklist } from './checks'

const originalDescriptors = {
    src: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
    type: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'type')
}
const createElementBackup = document.createElement

// Monkey patch the createElement method to prevent dynamic scripts from executing
document.createElement = function(...args) {
    // If this is not a script tag, bypass

    if(args[0].toLowerCase() === 'iframe' && TYPE_SANDBOX !== false){
        if (TYPE_SANDBOX === 'remove'){
            return null;
        }
        const scriptElt = createElementBackup.bind(document)(...args)

        // Use the prototype descriptors
        Object.defineProperties(scriptElt, {
            'src': {
                get() {
                    return originalDescriptors.src.get.call(this)
                },
                set(value) {
                    if(isOnBlacklist(value, scriptElt.type)) {
                        scriptElt.sandbox = TYPE_SANDBOX
                    }
                    return originalDescriptors.src.set.call(this, value)
                }
            },
            'sandbox': {
                set(value) {
                    return originalDescriptors.type.set.call(
                        this,
                        isOnBlacklist(scriptElt.src) ?
                            TYPE_SANDBOX :
                            value
                    )
                }
            }
        })
    
        // Monkey patch the setAttribute function so that the setter is called instead
        scriptElt.setAttribute = function(name, value) {
            if(name === 'sandbox' || name === 'src')
                scriptElt[name] = value
            else
                HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value)
        }
    
        return scriptElt
    }

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
        if(name === 'type' || name === 'src')
            scriptElt[name] = value
        else
            HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value)
    }

    return scriptElt
}