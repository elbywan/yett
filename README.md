# Script blocker

#### Monitor scripts execution.

##### Simply drop script-blocker on top of your .html page with a blacklist and it will allow you to block and delay the execution of other scripts.

## Why?

I know, the obvious question right now is:

`Why the hell should I block scripts inside my own controlled web page ❗️❓`

We at Snips have encountered the following use case:

Suppose that you want to use analytics on your website. And suppose that for you privacy really matters, and that you don't want to track your website users right away, but to actually give them the choice to be tracked (or not).

Plenty of third party analytics services will ask you to drop minified javascript code inside your html, which will be super convenient but you will have absolutely no control when this code will be executed. And it **will** be executed as soon as the page loads.

And start uploading data immediately.

So, at this point you have two options :

- Try looking at the minified code yourself, extract the IDs contained inside and make the call toggleable yourself.
- Drop script-blocker on top of the page, add a blacklist and let it do its magic ✨.

----------

**Note that script-blocker works for every script, not only analytics.**

*And on a side note, it is technically quite amazing to know that a simple js script can control and monitor other ones, even those included with a script tag.* 😉

## Usage

Script-blocker needs a `blacklist`, which is an array of regexes to test urls against.

```html
<script>
    // Add a global variable *before* script-blocker is loaded.
    SCRIPT_BLOCKER_BLACKLIST = [
        /googletagmanager\.com/,
        /piwik\.php/,
        /cdn\.mxpnl\.com/
    ]
</script>
```

### CDN


Finally, include script-blocker with a script tag **before** other scripts you want to delay:

```html
<script src='unpkg.com/script-blocker'></script>
```

Then, use `window.scriptBlocker.unblock()` to resume the blocked scripts execution.

### NPM

You can also use npm to install script-blocker:

```bash
npm i snipsco/script-blocker
```

```js
window.SCRIPT_BLOCKER_BLACKLIST = [
    // ... //
]
// Side effects here!
import { unblock } from 'script-blocker'

unblock()
```

### Unblock

```js
unblock(...scriptUrls: String[])
```

> Unblocks blacklisted scripts.

If you don't specify a `scriptUrls` argument, every script will be executed.
Otherwise, the blacklist regexes that match any of the `scriptUrls` provided will be removed, and only the scripts that are not considered as blacklisted anymore will execute.


## Browser compatibility

The most 'advanced' javascript feature that `script-blocker` uses is [Mutation Observers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), which is compatible with all 4 major browsers as well as `IE11`.

### Caveats

#### Add a type property to the scripts tags

**If you want to target `Microsoft Edge` or `Internet Explorer` users, then you should read this!**


In order to support script tag blocking with `Edge` or `IE`, you will have to add an attribute yourself on script tags that need to be blocked.

```html
<!-- Add type="javascript/blocked" yourself, otherwise it will only work on Chrome/Firefox/Safari -->
<script src="..." type="javascript/blocked"></script>
```

#### Monkey patch

This library monkey patches `document.createElement`. No way around this.

#### Dynamic requests

Scripts loaded using XMLHttpRequest and Fetch are not blocked. It would be trivial to monkey patch them, but most tracking scripts are not loaded using these 2 methods anyway.

## Suggestions

If you have any request or feedback for us feel free to open an issue!

## License

MIT