export const TYPE_ATTRIBUTE = 'javascript/blocked'

export const TYPE_SANDBOX = window.TYPE_SANDBOX 

export const patternsObj = {
    blacklist: null,
    whitelist: null
}

export const patterns = {
    blacklist:  window.YETT_BLACKLIST,
    whitelist:  window.YETT_WHITELIST
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
export const backupIframes = {
    blacklisted: []
}