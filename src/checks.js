import { patterns, TYPE_ATTRIBUTE } from './variables'

export const isUrl = pattern => {
    return pattern.startsWith('http') || pattern.slice(-1) != '/'
} 

/*
* pattern: tagName:attribute/expresion/blockingType
* node: an html node or a string with an url or a string to evaluate pattern: tagName:attribute/expresion/ 
*       (las expression must end on /) 
*/
export const testPattern = (pattern,node) => {
    if(typeof node === "string"){
        if ( !node.startsWith('http') && node.slice(-1) == '/' && (node.replace(/\\/g,'').match(/\//g) || []).length == 2){
            const pos = node.indexOf('/')
            const posEnd = node.indexOf('/',pos+1)
            const value = node.substring(pos+1,posEnd-1)
            let type = 'src'
            let tagName = 'SCRIPT'
            if(pos != 0){
                let arr_type = node.substring(0,pos).split(":")
                if (arr_type.length > 1){
                    type = arr_type[1]
                    tagName = arr_type[0].toUpperCase()
                }else{
                    type = arr_type[0]
                } 
            }
            node = {'tagName': tagName}
            node[type]=value           
        }else{
            node = {'src': node, 'tagName': null}
        }
    }
    if (! (typeof pattern === "string")){
        if (pattern instanceof RegExp && node.tagName === "SCRIPT" && node.src)
            return pattern.test(node.src)
        else
            return false
    }
    if ((pattern.replace(/\\/g,'').match(/\//g) || []).length != 2)
        return false
    const pos = pattern.indexOf('/')
    const posEnd = pattern.indexOf('/',pos+1)
    let blockingType = pattern.substring(posEnd+1)    
    let type = 'src'
    let tagName = null
    if(pos != 0){
        let arr_type = pattern.substring(0,pos).split(":")
        if (arr_type.length > 1){
            type = arr_type[1]
            tagName = arr_type[0].toUpperCase()
        }else{
            type = arr_type[0]
        }
    }
    if (tagName && node.tagName && tagName !== node.tagName) return false;
    if (blockingType.length < 1 )
        blockingType = true
    pattern = pattern.substring(pos,posEnd+1)
    if (!node[type]){
        if (pattern == '//') return blockingType
        else return false
    }
    if (pattern == '//') return false
    return eval(pattern).test(node[type]) ? blockingType : false
}
/*
*   blockingType
*   Returns false if not blocked, true if default blocking type (delete node),or blocking type in rule
*   whith '//' pattern can block local scripts:
*   - false
*   - true or remove
*   - attribute:value
*   - javascript:function whith node as parameter
*/
export const isOnBlacklist = (node) => {
    let blockingType = false
   
    if (patterns.blacklist){
        blockingType =  patterns.blacklist.some(pattern => testPattern(pattern,node))
    }

    if (patterns.whitelist){
        let doBlocking =  patterns.whitelist.every(pattern => !testPattern(pattern,node))

        //default action block all scripts not whitelisted      
        // if (blockingType === false && node.tagName && node.tagName === 'SCRIPT' && node.src)
        //     blockingType = true
        blockingType = doBlocking ? blockingType: false
    }    
    if (node.type && node.type === TYPE_ATTRIBUTE)
        blockingType = blockingType ? blockingType: true
    return blockingType

}

export const willBeUnblocked = function(node) {
    let blockingType = false

    if (!patterns.blacklist || patterns.blacklist == false)
        return true
    // if (patterns.blacklist){
    //     blockingType =  patterns.blacklist.every(pattern => !testPattern(pattern,node))
    // }
    //if not in blacklist must be unblocked
    if (patterns.whitelist){
        blockingType =  patterns.whitelist.some(pattern => testPattern(pattern,node))
    }    

    return blockingType
}