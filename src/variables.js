
export const TYPE_ATTRIBUTE = 'javascript/blocked'

export const jsonStringify = value => {
    return JSON.stringify(value,replacer,2)
}
export const jsonParse = value => {
    return JSON.parse(value,reviver) 
}

export const patternsObj = {
    blacklist: null,
    whitelist: null
}

export const patterns = {
    blacklist:  window.localStorage.YETT_BLACKLIST ? jsonParse(window.localStorage.YETT_BLACKLIST) : window.YETT_BLACKLIST,
    whitelist:  window.localStorage.YETT_WHITELIST ? jsonParse(window.localStorage.YETT_WHITELIST) : window.YETT_WHITELIST,
    tags: []
}



if (! (patterns.blacklist instanceof Array) && (patterns.blacklist instanceof Object)){
    patternsObj.blacklist = patterns.blacklist;
    patterns.blacklist = Object.values(patternsObj.blacklist);
}
if (! (patterns.whitelist instanceof Array) && (patterns.whitelist instanceof Object)){
    patternsObj.whitelist = patterns.whitelist;
    patterns.whitelist = Object.values(patternsObj.whitelist);
    
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

// Backup list containing the original blacklisted script elements
export const backupScripts = {
    blacklisted: []
}

export const blockNodeNoBackup = (node,blockingType,attribute) => {

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
        if(!type)
            type = 'src'
        if(type.startsWith('_backup_') || type == 'type' )
            return false
        if (node['type'] != TYPE_ATTRIBUTE){
            node['_backup_type'] = node['type'] 
            node['type'] = TYPE_ATTRIBUTE
        }           
        if (type == 'javascript'){
            eval(value)          
        }else{
            node['_backup_'+type] = node[type]
            if (attribute === type)
                return value
            else
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
    backupScripts.blacklisted.push([node.cloneNode(true),parent])
    if (blockingType === true || blockingType === 'remove'){
        parent.removeChild(node)
        return true
    }
    return blockNodeNoBackup(node,blockingType)
}

function replacer(key, value) {
    if (value instanceof RegExp)
      return ("__REGEXP " + value.toString());
    else
      return value;
  }
  
  function reviver(key, value) {
    if (value.toString().indexOf("__REGEXP ") == 0) {
      var m = value.split("__REGEXP ")[1].match(/\/(.*)\/(.*)?/);
      return new RegExp(m[1], m[2] || "");
    } else
      return value;
  }

