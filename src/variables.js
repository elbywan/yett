export const TYPE_ATTRIBUTE = 'javascript/blocked'

export const patterns = {
    blockList: window.YETT_BLOCK_LIST,
    allowList: window.YETT_ALLOW_LIST
}

// Backup list containing the original blockListed script elements
export const backupScripts = {
    blockListed: []
}