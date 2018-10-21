export const TYPE_ATTRIBUTE = 'javascript/blocked'

export const patternsObj = {
    blacklist: null,
    whitelist: null
}

export const patterns = {
    blacklist:  window.YETT_BLACKLIST,
    whitelist:  window.YETT_WHITELIST,
    tags: []
}

if (patterns.blacklist){
  patterns.blacklist.forEach(element => {
    if (typeof element === 'string'){
        const pos = element.indexOf('/')
        if (pos > 1) {
            const tag = element.substring(0,pos)
            if (tag.length > 1)
                patterns.tags.push(tag)
        }
    }
  })
}

if (! (patterns.blacklist instanceof Array) && (patterns.blacklist instanceof Object)){
    patternsObj.blacklist = patterns.blacklist;
    patterns.blacklist = Object.keys(patternsObj.blacklist);
}
if (! (patterns.whitelist instanceof Array) && (patterns.whitelist instanceof Object)){
    patternsObj.whitelist = patterns.whitelist;
    patterns.whitelist = Object.keys(patternsObj.whitelist);
    
} 
// Backup list containing the original blacklisted script elements
export const backupScripts = {
    blacklisted: []
}

export const blockNodeNoBackup = (node,blockingType) => {

    if(typeof blockingType === "string" && blockingType != "remove"){
        let arr = blockingType.split(":")
        let type = 'src'
        let value = null
        if(arr.length < 1){
            value = arr[0]
        }else{
            type = arr[0]
            value = arr[1]
        }
        if (type == 'javascript'){
            eval(value)
        }else{
            node[type] = value
        }
        return true
    }
    return false
}

export const blockNode = (node,blockingType) => {
    const parent = node.parentElement
    if (!parent)
        return false
    backupScripts.blacklisted.push([node.cloneNode(),parent])
    if (blockingType === true || blockingType === 'remove'){
        parent.removeChild(node)
        return true
    }
    return blockNodeNoBackup(node,blockingType)
}