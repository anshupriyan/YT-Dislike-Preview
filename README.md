# ⚡ Chrome Extensions — Developer Notes

> _Everything you need to build, debug, and ship extensions that don't suck._

---

## 🗂️ Anatomy of an Extension

```
my-extension/
├── manifest.json          ← The brain. Required.
├── background.js          ← Service worker (MV3)
├── content.js             ← Injected into web pages
├── popup.html / popup.js  ← The little UI window
├── options.html           ← Settings page
└── icons/                 ← 16, 48, 128px PNGs
```

---

## 📋 Manifest v3 — Minimal Starter

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "Does something awesome.",
  "permissions": ["storage", "activeTab", "scripting"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

> ⚠️ **MV2 is deprecated.** Migrate to MV3 or extensions will stop working in Chrome.

---

## 🔑 Permissions Cheatsheet

|Permission|What it unlocks|
|---|---|
|`activeTab`|Access the current tab (safe, minimal)|
|`tabs`|Query/modify all tabs|
|`storage`|`chrome.storage.local` / `.sync`|
|`scripting`|Inject scripts programmatically|
|`contextMenus`|Right-click menu items|
|`notifications`|Desktop notifications|
|`webRequest`|Intercept / observe network requests|
|`cookies`|Read/write browser cookies|
|`identity`|OAuth2 / Google sign-in|
|`alarms`|Background timers / scheduling|

> 💡 **Rule of least privilege:** Only request what you need. Users and the Web Store both judge you for it.

---

## 🧠 Background Service Worker

The heart of MV3. Replaces persistent background pages — **it can go idle and wake up.**

```js
// background.js

// Runs once on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_DATA') {
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }));
    return true; // Keep the message channel open for async response
  }
});
```

> ⚠️ **Service workers are ephemeral.** Don't store state in global variables — use `chrome.storage` instead.

---

## 💉 Content Scripts

Injected into web pages. Runs in an **isolated world** — can read/modify the DOM, but can't access page's JS variables directly.

```js
// content.js

// Read the DOM
const title = document.title;

// Modify the DOM
document.body.style.backgroundColor = '#1a1a2e';

// Send a message to background
chrome.runtime.sendMessage({ type: 'PAGE_TITLE', title }, (response) => {
  console.log('Background replied:', response);
});

// Listen for messages FROM background or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    sendResponse({ text: window.getSelection().toString() });
  }
});
```

---

## 🪟 Popup Script

```js
// popup.js
document.getElementById('btn').addEventListener('click', async () => {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute script in that tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body.style.border = '3px solid red',
  });
});
```

---

## 💾 Storage API

Prefer `chrome.storage` over `localStorage` — it's async and works across contexts.

```js
// Save
await chrome.storage.local.set({ theme: 'dark', count: 42 });

// Read
const { theme, count } = await chrome.storage.local.get(['theme', 'count']);

// Listen for changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.theme) {
    console.log('Theme changed to:', changes.theme.newValue);
  }
});
```

|API|Quota|Syncs?|
|---|---|---|
|`chrome.storage.local`|5MB+|❌ No|
|`chrome.storage.sync`|100KB|✅ Yes|
|`chrome.storage.session`|1MB|❌ No (cleared on browser close)|

---

## 📡 Messaging Patterns

### Popup → Content Script

```js
// In popup.js
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const response = await chrome.tabs.sendMessage(tab.id, { type: 'DO_THING' });
```

### Content Script → Background

```js
// In content.js
const response = await chrome.runtime.sendMessage({ type: 'DO_THING' });
```

### Background → Content Script

```js
// In background.js
chrome.tabs.sendMessage(tabId, { type: 'DO_THING' });
```

---

## 🐛 Debugging Tips

```
chrome://extensions          → Load unpacked, see errors, inspect workers
chrome://extensions/?errors  → Detailed crash logs
```

- **Inspect popup:** Right-click the extension icon → _Inspect_
- **Inspect service worker:** Extensions page → _"Service Worker"_ link
- **Inspect content script:** DevTools on the page → Sources → Content Scripts
- **Force reload:** `chrome.runtime.reload()` from background, or Cmd/Ctrl+R on extensions page

---

## 🚀 Publishing to Chrome Web Store

```
1. Zip your extension folder (NOT the folder itself, its contents)
2. Go to → https://chrome.google.com/webstore/devconsole
3. Pay the one-time $5 developer fee
4. Upload zip → fill in store listing details
5. Add screenshots (1280x800 or 640x400)
6. Submit for review → ~1-3 business days
```

**Required assets:**

- [ ] At least 1 screenshot
- [ ] 128×128 icon
- [ ] Short description (≤132 chars)
- [ ] Privacy policy (if you collect any data)

---

## ⚡ Quick Patterns

### Inject CSS into a page

```js
chrome.scripting.insertCSS({
  target: { tabId },
  css: 'body { font-family: monospace !important; }'
});
```

### Open options page

```js
chrome.runtime.openOptionsPage();
```

### Badge text on icon

```js
chrome.action.setBadgeText({ text: '42' });
chrome.action.setBadgeBackgroundColor({ color: '#e63946' });
```

### Context menu item

```js
chrome.contextMenus.create({
  id: 'myItem',
  title: 'Do something with "%s"',
  contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info) => {
  console.log('Selected:', info.selectionText);
});
```

---

## 🔗 Essential Links

- 📖 [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- 🔄 [MV2 → MV3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- 🏪 [Chrome Web Store Dashboard](https://chrome.google.com/webstore/devconsole)
- 🧪 [Extension Samples (GitHub)](https://github.com/GoogleChrome/chrome-extensions-samples)
- 💬 [Chromium Extensions Forum](https://groups.google.com/a/chromium.org/g/chromium-extensions)

---

_Last updated: May 2026 · Manifest V3 · Chrome 120+_
