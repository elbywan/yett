import { patterns, TYPE_ATTRIBUTE } from './variables'

export const isOnBlacklist = (src, type) => (
    src &&
    (!type || type !== TYPE_ATTRIBUTE) &&
    isBlacklistedSource(src)
)

export const isBlacklistedSource = function(src) {
  const srcStart = src === undefined ? "" : src.split("?")[0];
  return srcStart &&
  (
    (!patterns.blacklist || patterns.blacklist.some(pattern => pattern.test(srcStart))) &&
    (!patterns.whitelist || patterns.whitelist.every(pattern => !pattern.test(srcStart)))
  )
}

export const willBeUnblocked = function(script) {
    const src = script.getAttribute('src')
    return (
        patterns.blacklist && patterns.blacklist.every(entry => !entry.test(src)) ||
        patterns.whitelist && patterns.whitelist.some(entry => entry.test(src))
    )
}