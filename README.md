<h1 align="center">
  Yett<br>
  <br>
  <a href="https://www.npmjs.com/package/yett"><img alt="npm-badge" src="https://img.shields.io/npm/v/yett.svg" height="20"></a>
  <a href="https://github.com/snipsco/yett/blob/master/LICENSE"><img alt="license-badge" src="https://img.shields.io/npm/l/yett.svg" height="20"></a>
  <a href="https://bundlephobia.com/result?p=yett"><img alt="size-badge" src="https://img.shields.io/bundlephobia/minzip/yett.svg"></a>
  <a href="https://travis-ci.org/snipsco/yett"><img src="https://travis-ci.org/snipsco/yett.svg?branch=master" alt="ci-badge" height="20"></a>
  <a href="#browser-compatibility"><img src="https://badges.herokuapp.com/browsers?firefox=60&googlechrome=66&safari=11&iexplore=!9,!10,11&microsoftedge=17" alt="bundle-badge" height="20"></a>
</h1>

### 🔐 A small webpage library to control the execution of (third party) scripts like analytics

##### Simply drop yett at the top of your html and it will allow you to block and delay the execution of other scripts.

## Background

[❓] **`So, why on Earth would I want to block scripts on my own website?`**

We use `yett` in order to provide [GDPR compliant consent-first-analytics](https://medium.com/snips-ai/gdpr-compliant-website-analytics-putting-users-in-control-684b17a1463f), via an UI like below.

<br>

<img src="https://cdn.rawgit.com/snipsco/yett/ead29c36/privacy-bar.png" alt="bar"></img>
<h6 align="center"><i>Analytics scripts are blocked until users Accepts, in production on <a href="https://snips.ai">https://snips.ai</a></i></h6>

<br>

Blocking execution of analytics script (until consent is given) can be done manually, but the problem is that analytics providers often provide minified code embeds that you have to include in your html as they are. If you want to exercise control over their execution, then you have to tamper with this minified JS yourself, which is complex and does not scale well if you load several 3rd party scripts.

Another thing to consider is that these scripts first setup a local buffer that record user actions locally, and then upload the data after a remote script is loaded asynchronously. Meaning that if the whole thing is simply wrapped inside a callback *(as some other libraries do)* then every action performed by the user on the web page before the callback gets executed won't get recorded and will never appear in your analytics dashboard.

Thus we invented `yett`. Just drop in the script and define a domain blacklist - `yett` will take care of the rest ✨.

------

And on a side note, it is technically quite amazing to know that **[a few lines of js](https://medium.com/snips-ai/how-to-block-third-party-scripts-with-a-few-lines-of-javascript-f0b08b9c4c0)** is all you need to control execution of other scripts, even those included with a script tag. 😉

##### *Also, [yett](https://en.wikipedia.org/wiki/Yett) has an interesting meaning.*

## Usage

#### [:tv: Demo](https://snipsco.github.io/yett/)

#### Small example

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Regular head items here… -->

    <!-- 1) Add a blacklist -->
    <script>
      window.YETT_BLACKLIST = [
        /my-blacklisted-domain/,
      ]
      // Or a whitelist
      window.YETT_WHITELIST = [
        /my-whitelisted-domain/,
      ]
    </script>
    <!-- 2) Include Yett -->
    <script src="https://unpkg.com/yett"></script>
    <!-- 3) Profit! -->
    <!-- This script is blocked -->
    <script src="https://my-blacklisted-domain.com/file.js"></script>
    <script>
      // This one too
      (function() {
        var script = document.createElement('script')
        script.setAttribute('src', 'https://my-blacklisted-domain.com/some-file.js')
        script.setAttribute('type', 'application/javascript')
        document.head.appendChild(script)
      })()
    </script>
  </head>
  <body>
    <button onclick="window.yett.unblock()">Unblock</button>
  </body>
</html>
```

**⚠️ It is strongly recommended (but not necessary) that you [add type attributes](https://github.com/snipsco/yett#add-a-type-attribute-manually) to `<script>` tags having src attributes that you want to block. It has the benefit of preventing the scripts from begin downloaded in major browsers.**

**💡 In any case, if you would like to ensure that cookies are not sent to third-party servers during the initial request you can use the [`crossorigin="anonymous"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin) attribute. Check [this link](https://github.com/snipsco/yett/issues/20#issuecomment-599256485) for more details.**

## Add a blacklist

Yett needs a `blacklist`, which is an array of regexes to test urls against.

```html
<script>
    // Add a global variable *before* yett is loaded.
    YETT_BLACKLIST = [
        /www\.google-analytics\.com/,
        /piwik\.php/,
        /cdn\.mxpnl\.com/
    ]
    // OR
    YETT_WHITELIST = [
        /my-whitelisted-domain/
    ]
</script>
```

### CDN


Finally, include `yett` with a script tag **before** other scripts you want to delay:

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
// OR
window.YETT_WHITELIST = [
    // ... //
]
// Side effects here! Do not import more than once!
import { unblock } from 'yett'

unblock()
```

### Unblock

```js
unblock(...scriptUrlsOrRegexes: (String | RegExp)[])
```

> Unblocks blacklisted scripts.

If you don't specify a `scriptUrlsOrRegexes` argument, all the scripts that were previously blocked will be executed.
Otherwise, the `scriptUrlsOrRegexes` provided will be either removed from the blacklist or added to the whitelist and executed.

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

|                        |                    `<script>`                   |     `<script type="javascript/blocked">`    |      `document.createElement('script')`     |
|------------------------|:-----------------------------------------------:|:-------------------------------------------:|:-------------------------------------------:|
| **Prevents loading**   | ![](https://badges.herokuapp.com/browsers?firefox=-60&googlechrome=-66&safari=-11&iexplore=-11&microsoftedge=-17) | ![](https://badges.herokuapp.com/browsers?firefox=60&googlechrome=66&safari=-11&iexplore=-11&microsoftedge=-17) | ![](https://badges.herokuapp.com/browsers?firefox=60&googlechrome=66&safari=11&iexplore=-11&microsoftedge=-17) |
| **Prevents execution** | ![](https://badges.herokuapp.com/browsers?firefox=60&googlechrome=66&safari=11&iexplore=11&microsoftedge=17) | ![](https://badges.herokuapp.com/browsers?firefox=60&googlechrome=66&safari=11&iexplore=11&microsoftedge=17) | ![](https://badges.herokuapp.com/browsers?firefox=60&googlechrome=66&safari=11&iexplore=11&microsoftedge=17) |

The most 'advanced' javascript feature that `yett` uses is [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), which is compatible with all major browsers as well as `IE11`.

If you need `IE 9/10` compatibility, you will have to use a [polyfill](https://github.com/megawac/MutationObserver.js):

```html
<script src="https://cdn.jsdelivr.net/npm/mutationobserver-shim/dist/mutationobserver.min.js"></script>
```

### Caveats

#### Add a type attribute manually

Adding this attribute prevents the browser from downloading the script on `Chrome` and `Firefox`.

```html
<script src="..." type="javascript/blocked"></script>
```

#### Monkey patch

This library monkey patches `document.createElement`. No way around this.

This means that `yett` is not compatible with third-party browser extensions that also monkey patch this native browser function.

#### Dynamic requests

Scripts loaded using XMLHttpRequest and Fetch are not blocked. It would be trivial to monkey patch them, but most tracking scripts are not loaded using these 2 methods anyway.

## Suggestions

If you have any request or feedback for us feel free to open an [issue](https://github.com/snipsco/yett/issues)!

So far we’re using this library for analytics, but it could also be used to block advertising until consent, and other things we haven’t thought about yet. We’re excited to see what use cases the community comes up with!

## License

MIT
