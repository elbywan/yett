export const TYPE_ATTRIBUTE = 'javascript/blocked'

export const TYPE_SANDBOX = window.TYPE_SANDBOX ? window.TYPE_SANDBOX : ""

export const patterns = {
    blacklist: window.YETT_BLACKLIST,
    whitelist: window.YETT_WHITELIST
}

// Backup list containing the original blacklisted script elements
export const backupScripts = {
    blacklisted: []
}
export const backupIframes = {
    blacklisted: []
}