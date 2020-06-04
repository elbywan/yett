import { TYPE_ATTRIBUTE } from './variables'
import { isOnBlacklist } from './checks'

const createElementBackup = document.createElement

const originalDescriptors = {
    src: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
    type: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'type')
}

// Monkey patch the createElement method to prevent dynamic scripts from executing
document.createElement = function(...args) {
    // If this is not a script tag, bypass
    if(args[0].toLowerCase() !== 'script')
        return createElementBackup.bind(document)(...args)

    const scriptElt = createElementBackup.bind(document)(...args)

    // Define getters / setters to ensure that the script type is properly set
    try {
        Object.defineProperties(scriptElt, {
            'src': {
                get() {
                    return originalDescriptors.src.get.call(this)
                },
                set(value) {
                    if(isOnBlacklist(value, scriptElt.type)) {
                        originalDescriptors.type.set.call(this, TYPE_ATTRIBUTE)
                    }
                    originalDescriptors.src.set.call(this, value)
                }
            },
            'type': {
                set(value) {
                    const typeValue = isOnBlacklist(scriptElt.src, scriptElt.type) ? TYPE_ATTRIBUTE : value
                    originalDescriptors.type.set.call(this, typeValue)
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
    } catch (error) {
        // eslint-disable-next-line
        console.warn(
            'Yett: unable to prevent script execution for script src ', scriptElt.src, '.\n',
            'A likely cause would be because you are using a third-party browser extension that monkey patches the "document.createElement" function.'
        )
    }
    return scriptElt
}