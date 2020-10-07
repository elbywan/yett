import { patterns, TYPE_ATTRIBUTE } from './variables'

export const isOnBlacklist = (src, type) => (
    src &&
    (!type || type !== TYPE_ATTRIBUTE) &&
    (
        (!patterns.blockList || patterns.blockList.some(pattern => pattern.test(src))) &&
        (!patterns.allowList || patterns.allowList.every(pattern => !pattern.test(src)))
    )
)

export const willBeUnblocked = function(script) {
    const src = script.getAttribute('src')
    return (
        patterns.blockList && patterns.blockList.every(entry => !entry.test(src)) ||
        patterns.allowList && patterns.allowList.some(entry => entry.test(src))
    )
}