import { patterns } from './variables'
import { observe } from './observer'
import { monkey } from './monkey'

export { unblock } from './unblock'

export function init({ blacklist, whitelist } = {}) {
    patterns.blacklist = (patterns.blacklist || blacklist) && [
        ...(patterns.blacklist || []),
        ...(blacklist || [])
    ]
    patterns.whitelist = (patterns.whitelist || whitelist) && [
        ...(patterns.whitelist || []),
        ...(whitelist || [])
    ]
    observe()
    monkey()
}
