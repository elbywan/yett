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
        if ( !node.startsWith('http') && node.slice(-1) == '/'){
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
            node = {'src': node, 'tagName': 'SCRIPT'}
        }
    }
    if (! (typeof pattern === "string")){
        if (node.tagName === "SCRIPT" && node.src)
            return pattern.test(node.src)
        else
            return false
    }
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
    if (tagName && tagName !== node.tagName) return false;
    if (blockingType.length < 1 )
        blockingType = true
    pattern = pattern.substring(pos,posEnd+1)
    if (!node[type]){
        if (pattern == '//') return blockingType
        else return false
    }
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
    
    if (node.type && node.type === TYPE_ATTRIBUTE) return true;

    if (patterns.blacklist){
        blockingType =  patterns.blacklist.some(pattern => testPattern(pattern,node))
    }

    if (patterns.whitelist){
        blockingType =  patterns.whitelist.every(pattern => !testPattern(pattern,node))
    }    

    return blockingType

}

export const willBeUnblocked = function(script) {
    // const src = script.getAttribute('src')
    return (
        patterns.blacklist && patterns.blacklist.every(entry => !testPattern(entry,script)) ||
        patterns.whitelist && patterns.whitelist.some(entry => testPattern(entry,script))
    )
}