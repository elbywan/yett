<h1 align="center">
  Yett<br>
  <br>
  <a href="https://www.npmjs.com/package/yett"><img alt="npm-badge" src="https://img.shields.io/npm/v/yett.svg" height="20"></a>
  <a href="https://github.com/snipsco/yett/blob/master/LICENSE"><img alt="license-badge" src="https://img.shields.io/npm/l/yett.svg" height="20"></a>
  <a href="https://bundlephobia.com/result?p=yett"><img alt="size-badge" src="https://img.shields.io/bundlephobia/minzip/yett.svg"></a>
  <a href="#browser-compatibility"><img src="https://badges.herokuapp.com/browsers?firefox=60&googlechrome=66&iexplore=!9,!10,11&microsoftedge=17" alt="bundle-badge" height="20"></a>
</h1>

### 🔐 A small webpage library to control the execution of (third party) scripts

##### Simply drop yett at the top of your html and it will allow you to block and delay the execution of other (for example - analytics) scripts.

## Why?

<img src="https://cdn.rawgit.com/snipsco/yett/ead29c36/privacy-bar.png" alt="bar"></img>

**Check out this [blog post](https://medium.com/snips-ai/gdpr-compliant-website-analytics-putting-users-in-control-684b17a1463f) that explains our motives. For the short version see below.**

-----

[❓] **`So, why on Earth should I block scripts on my own website?`**

Our use case at [Snips](https://snips.ai) is to prevent collecting analytics data from users ahead of time without asking for their consent.

The problem is that these third party scripts are often minified pieces of code that you have to include as is. If you want to exercise control over their execution, then you would have to tamper with this minified JS yourself.

With `yett`, you just need to drop the script and define a blacklist of domains. It will do the magic ✨.

------

`Yett` is used it in production for our [console website](https://console.snips.ai).

*On a side note, it is technically quite amazing to know that a few lines of js is all you need to control execution of other scripts, even those included with a script tag.* 😉

##### *Also, [yett](https://en.wikipedia.org/wiki/Yett) has an interesting meaning.*

## Usage

Yett needs a `blacklist`, which is an array of regexes to test urls against.

```html
<script>
    // Add a global variable *before* yett is loaded.
    YETT_BLACKLIST = [
        /www\\.google-analytics\\.com/,
        /piwik\.php/,
        /cdn\.mxpnl\.com/
    ]
</script>
```

**It is strongly recommended to [add a type attribute](https://github.com/snipsco/yett#add-a-type-attribute-manually)  to any `<script>` tag you want to block. It will prevent them from loading in major browsers and execution on `Edge`.**

### CDN


Finally, include yett with a script tag **before** other scripts you want to delay:

```html
<script src='unpkg.com/yett'></script>
```

Then, use `window.yett.unblock()` to resume execution of the blocked scripts.

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

#### Add a type attribute manually

> Needed for targetting `Microsoft Edge`! Adding this property also prevents the script from loading on `Chrome`, `Safari` and `Firefox`.

In order to prevent the execution of the script for `Edge` users, you will have to add a type attribute yourself.

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

So far we’re using this library for analytics, but it could also be used to block advertising until consent, and other things we haven’t thought about yet. We’re excited to see what use cases the community comes up with!

## License

MIT
