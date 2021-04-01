export const TYPE_ATTRIBUTE = 'javascript/blocked'
export const HIDDEN_SRC_ATTRIBUTE = 'yett-src'


export const patterns = {
    blacklist: window.YETT_BLACKLIST,
    whitelist: window.YETT_WHITELIST
}

export const features = {
    iframe: window.YETT_IFRAME
}

// Backup list containing the original blacklisted elements
export const backupElements = {
    blacklisted: []
}