<div align="center">
  <img src="assets/logo.png" alt="YT Dislike Preview Logo" width="80" height="80" style="border-radius: 16px;" />
  <h1>YT Dislike Preview</h1>
  <p><strong>Restoring visibility into dislike counts YouTube hid — instantly, natively, and key-free.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
  [![Manifest](https://img.shields.io/badge/Manifest-V3-brightgreen.svg)](#)
  [![API Key](https://img.shields.io/badge/API_Key-None_Required-blue.svg)](#)
  [![Stars](https://img.shields.io/github/stars/anshupriyan/yt-engagement-lens.svg?style=social)](https://github.com/anshupriyan/yt-engagement-lens/stargazers)
  [![Forks](https://img.shields.io/github/forks/anshupriyan/yt-engagement-lens.svg?style=social)](https://github.com/anshupriyan/yt-engagement-lens/network/members)
</div>

---

<div align="center">
  <img width="358" height="362" alt="image" src="https://github.com/user-attachments/assets/d9f7b77d-7518-4a00-9c79-5b0dfead7b46" />

</div>

## 💡 Why This Exists

In 2021, YouTube made the controversial decision to hide public dislike counts, removing a critical tool for community feedback and content quality validation. **YT Dislike Preview** brings this visibility back. By leveraging the open Return YouTube Dislike dataset, this extension helps you evaluate video quality in under a second before you invest time watching.

---

## ✨ Features

*   **Thumbnail Overlays:** Save time by viewing like and dislike counts inline as native-looking metadata directly on video thumbnails across your home feed, search results, sidebar recommendations, channels, and playlists.
*   **Watch Page Metrics:** Restore full context with the exact dislike counts placed cleanly below the video description area for a native-feeling experience.
*   **YouTube Shorts Integration:** Bring back dislike counts on the YouTube Shorts sidebar action buttons.
*   **Zero Configuration:** Start instantly. The extension works out-of-the-box using the public API, requiring no personal API keys or setups.
*   **Lightweight & Privacy-First:** Built entirely on vanilla JavaScript and CSS to minimize browser memory footprint, featuring a fully security-hardened Manifest V3 codebase.

---

## 🛠️ Installation (Developer Mode)

Since this extension is in active development:

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/anshupriyan/YT-Dislike-Preview.git
    ```
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** (toggle in the top-right corner).
4.  Click **Load unpacked** (top-left corner).
5.  Select the root folder containing the `manifest.json` file.

*Note: A Chrome Web Store launch is planned! [Placeholder for Store Link]*

---

## ⚙️ How It Works

A lightweight content script ([content.js](content.js)) scans YouTube's elements and injects native-feeling dislike badges. A background service worker ([background.js](background.js)) securely proxies requests to the Return YouTube Dislike API, validating all inputs and caching votes in memory to prevent redundant queries and ensure instantaneous rendering.

---

## 💬 Support This Project

*   **Discord:** [Join our community](https://discord.gg/9DZxKzxuJc) to chat, ask questions, or report bugs.
*   **Support Link:** [YOUR_SUPPORT_LINK_HERE]

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue first to discuss larger modifications before making a PR.

---

## 📊 Attribution & Data Source

This project uses the public API provided by [Return YouTube Dislike](https://returnyoutubedislike.com/). We would like to attribute and thank the Return YouTube Dislike project and its contributors for their excellent work and for making this data available. 

*   **Website:** [returnyoutubedislike.com](https://returnyoutubedislike.com/)
*   **Source Code:** [Anarios/return-youtube-dislike on GitHub](https://github.com/Anarios/return-youtube-dislike)

---

## 🛡️ License

Distributed under the MIT License.
