import { TYPE_ATTRIBUTE } from './variables'
import { isOnBlacklist } from './checks'

const createElementBackup = document.createElement

// Monkey patch the createElement method to prevent dynamic scripts from executing
document.createElement = function(...args) {
    // If this is not a script tag, bypass
    if(args[0].toLowerCase() !== 'script')
        return createElementBackup.bind(document)(...args)

    const scriptElt = createElementBackup.bind(document)(...args)
    const originalSetAttribute = scriptElt.setAttribute.bind(scriptElt)

    // Define getters / setters to ensure that the script type is properly set
    Object.defineProperties(scriptElt, {
        'src': {
            get() {
                return scriptElt.getAttribute('src')
            },
            set(value) {
                if(isOnBlacklist(value, scriptElt.type)) {
                    originalSetAttribute('type', TYPE_ATTRIBUTE)
                }
                originalSetAttribute('src', value)
                return true
            }
        },
        'type': {
            set(value) {
                const typeValue =
                    isOnBlacklist(scriptElt.src, scriptElt.type) ?
                        TYPE_ATTRIBUTE :
                    value
                originalSetAttribute('type', typeValue)
                return true
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