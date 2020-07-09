import { TYPE_ATTRIBUTE, HIDDEN_SRC_ATTRIBUTE, features } from './variables'
import { isOnBlacklist } from './checks'

const createElementBackup = document.createElement

var originalDescriptors = {
    script: {
      class: HTMLScriptElement,
      src: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
      type: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'type')
    }
}

if (features.iframe) {
  originalDescriptors.iframe = {
    class: HTMLIFrameElement,
    src: Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src')
  }
}

// Monkey patch the createElement method to prevent dynamic scripts from executing
document.createElement = function(...args) {
    // If this is not a patched tag, bypass
    const tagName = args[0].toLowerCase()
    const descriptors = originalDescriptors[tagName]
    if(descriptors === undefined)
        return createElementBackup.bind(document)(...args)

    const mockElt = createElementBackup.bind(document)(...args)

    // Define getters / setters to ensure that the script type is properly set
    try {
        Object.defineProperties(mockElt, {
            'src': {
                get() {
                    return descriptors.src.get.call(this)
                },
                set(value) {
                    if(isOnBlacklist(value, mockElt.type)) {
                        if (descriptors.type) {
                          descriptors.type.set.call(this, TYPE_ATTRIBUTE)
                        } else {
                          descriptors.class.prototype.setAttribute.call(this, HIDDEN_SRC_ATTRIBUTE, value)
                          value = undefined
                        }
                    }

                    if(value !== undefined)
                      descriptors.src.set.call(this, value)
                }
            },
            'type': {
                set(value) {
                    const typeValue = isOnBlacklist(mockElt.src, mockElt.type) ? TYPE_ATTRIBUTE : value
                    descriptors.type.set.call(this, typeValue)
                }
            }
        })

        // Monkey patch the setAttribute function so that the setter is called instead
        mockElt.setAttribute = function(name, value) {
            if(name === 'type' || name === 'src') {
                mockElt[name] = value
            } else
                descriptors.class.prototype.setAttribute.call(mockElt, name, value)
        }
    } catch (error) {
        // eslint-disable-next-line
        console.warn(
            'Yett: unable to prevent script execution for ' + tagName + ' src ', mockElt.src, '.\n',
            'A likely cause would be because you are using a third-party browser extension that monkey patches the "document.createElement" function.'
        )
    }
    return mockElt
}