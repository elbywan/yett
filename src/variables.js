export const TYPE_ATTRIBUTE = 'javascript/blocked'

export const patterns = {
    blacklist: window.YETT_BLACKLIST,
    whitelist: window.YETT_WHITELIST
}

// Backup list containing the original blacklisted script elements
export const backupScripts = {
    blacklisted: []
}

export const CONSOLE_WARN = window.YETT_CONSOLE_WARN
