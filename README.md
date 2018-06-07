# Yett

### 🔐 A small webpage library to control the execution of (third party) scripts

##### Simply drop yett at the top of your html and it will allow you to block and delay the execution of other scripts.

![npm](https://img.shields.io/npm/v/yett.svg)
![license](https://img.shields.io/npm/l/yett.svg)

[![Browsers](https://badges.herokuapp.com/browsers?firefox=60&googlechrome=66&iexplore=!9,!10,11&microsoftedge=17)](#browser-compatibility)

## Why?

I know, the obvious question right now is:

**`Why the hell should I block scripts on my own website ❗❓`**

We at [Snips](https://snips.ai) have encountered the following use case:

Suppose that you want to use analytics on your website. And suppose that for you privacy really matters, and that you don't want to collect analytics from your website users right away, but to actually ask them for their consent first.

Plenty of third party analytics services will ask you to drop minified javascript code inside your html, which will be super convenient but you will have absolutely no control when this code will be executed. And it **will** be executed as soon as the page loads.

And start uploading data immediately.

So, at this point you have two options :

- Try looking at the minified code yourself, extract the IDs contained inside and make the call toggleable yourself.

Or:

- Drop yett at the top of the page, add a blacklist and let it do its magic ✨.

----------

*And on a side note, it is technically quite amazing to know that a few lines of js is all you need to control execution of other scripts, even those included with a script tag.* 😉

##### *Also, [yett](https://en.wikipedia.org/wiki/Yett) has an interesting meaning.*

## Usage

Yett needs a `blacklist`, which is an array of regexes to test urls against.

```html
<script>
    // Add a global variable *before* yett is loaded.
    YETT_BLACKLIST = [
        /googletagmanager\.com/,
        /piwik\.php/,
        /cdn\.mxpnl\.com/
    ]
</script>
```

### CDN


Finally, include yett with a script tag **before** other scripts you want to delay:

```html
<script src='unpkg.com/yett'></script>
```

Then, use `window.scriptBlocker.unblock()` to resume execution of the blocked scripts.

### NPM

You can also use npm to install yett:

```bash
npm i yett
```

```js
window.YETT_BLACKLIST = [
    // ... //
]
// Side effects here!
import { unblock } from 'yett'

unblock()
```

### Unblock

```js
unblock(...scriptUrls: String[])
```

> Unblocks blacklisted scripts.

If you don't specify a `scriptUrls` argument, all blocked script will be executed.
Otherwise, only blacklist regexes that match any of the `scriptUrls` provided will be removed, and only the scripts that are not considered as blacklisted anymore will execute.

### Build locally

```bash
# Clone
git clone https://github.com/snipsco/yett
cd yett
# Install
npm i
# Serves demo @ localhost:8080
npm run dev
# Build for release
npm run build
```

## Browser compatibility

The most 'advanced' javascript feature that `yett` uses is [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), which is compatible with all major browsers as well as `IE11`.

If you absolutely need `IE 9/10` compatibility, then you have to use a [polyfill](https://github.com/megawac/MutationObserver.js):

```html
<script src="https://cdn.jsdelivr.net/npm/mutationobserver-shim/dist/mutationobserver.min.js"></script>
```

### Caveats

#### Add a type property to the scripts tags

**If you want to target `Microsoft Edge` users, then you should read this!**


In order to support script tag blocking with `Edge`, you will have to add an attribute yourself on script tags that need to be blocked.

```html
<!-- Add type="javascript/blocked" yourself, otherwise it will "only" work on Chrome/Firefox/Safari/IE -->
<script src="..." type="javascript/blocked"></script>
```

#### Monkey patch

This library monkey patches `document.createElement`. No way around this.

#### Dynamic requests

Scripts loaded using XMLHttpRequest and Fetch are not blocked. It would be trivial to monkey patch them, but most tracking scripts are not loaded using these 2 methods anyway.

## Suggestions

If you have any request or feedback for us feel free to open an [issue](https://github.com/snipsco/yett/issues)!

## License

MIT
