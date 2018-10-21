import { TYPE_ATTRIBUTE, blockNode, blockNodeNoBackup, patterns } from './variables'
import { isOnBlacklist } from './checks'

const originalDescriptors = {
    src: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
    type: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'type')
}
const createElementBackup = document.createElement

// Monkey patch the createElement method to prevent dynamic scripts from executing
document.createElement = function(...args) {

    const tag = args[0].toLowerCase() 
    const nodeElt = createElementBackup.bind(document)(...args)

    if(tag === 'script'){
        // Use the prototype descriptors
            Object.defineProperties(nodeElt, {
                'src': {
                    get() {
                        return originalDescriptors.src.get.call(this)
                    },
                    set(value) {
                        if(isOnBlacklist({'src':value,'type':nodeElt.type})) {
                            nodeElt.backup_type = nodeElt.type
                            nodeElt.type = TYPE_ATTRIBUTE
                        }
                        return originalDescriptors.src.set.call(this, value)
                    }
                },
                'type': {
                    set(value) {
                        const blockingType = isOnBlacklist(nodeElt)
                        if (blockingType) nodeElt.backup_type = value
                        return originalDescriptors.type.set.call(
                            this,
                            blockingType ?
                                TYPE_ATTRIBUTE :
                                value
                        )
                    }
                }
            })

        // Monkey patch the setAttribute function so that the setter is called instead
        nodeElt.setAttribute = function(name, value) {
            if(name === 'type' || name === 'src')
                nodeElt[name] = value
            else
                HTMLScriptElement.prototype.setAttribute.call(nodeElt, name, value)
        }

    }   

    if (patterns.tags.some(element => (tag === element[0]))){
        let props={ }
        props[patterns.tags[tag]]={
                get() {
                    return originalDescriptors.src.get.call(this)
                },
                set(value) {
                    if(isOnBlacklist(nodeElt)) {
                        nodeElt.backup_type = nodeElt.type
                        nodeElt.type = TYPE_ATTRIBUTE
                    }
                    return originalDescriptors.src.set.call(this, value)
                }
        }
        Object.defineProperties(nodeElt, props)

        // Monkey patch the setAttribute function so that the setter is called instead
        nodeElt.setAttribute = function(name, value) {
            if(name === tag)
                nodeElt[name] = value
            else
                HTMLScriptElement.prototype.setAttribute.call(nodeElt, name, value)
        }        
    }
    if (!blockNodeNoBackup(nodeElt)) nodeElt.style = 'display:none'

    return nodeElt
}