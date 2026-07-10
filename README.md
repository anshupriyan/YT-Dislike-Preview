<div align="center">
  <img src="assets/logo.png" alt="YouTube Dislike Preview Logo" width="80" height="80" style="border-radius: 16px;" />
  <h1>YouTube Dislike Preview</h1>
  <p><strong>A lightweight Chrome Extension (Manifest V3) that displays like/dislike counts and ratios for YouTube videos.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
  [![Manifest](https://img.shields.io/badge/Manifest-V3-brightgreen.svg)](#)
  [![Stars](https://img.shields.io/github/stars/anshupriyan/yt-engagement-lens.svg?style=social)](https://github.com/anshupriyan/yt-engagement-lens/stargazers)
  [![Forks](https://img.shields.io/github/forks/anshupriyan/yt-engagement-lens.svg?style=social)](https://github.com/anshupriyan/yt-engagement-lens/network/members)
</div>

---

<div align="center">
  <img width="258" height="262" alt="image" src="https://github.com/user-attachments/assets/ca3e0ab9-1c4d-47c3-bf77-83e7aa9266a7" />
  <img width="402" height="302" alt="image" src="https://github.com/user-attachments/assets/ab1c8726-28d5-4893-8477-2de42f002466" />
</div>

## ✨ Features

* **Thumbnail Overlays:** Displays like/dislike counts directly on video thumbnails (home feed, search results, sidebar recommendations, channels, and playlists).
* **Watch Page Metrics:** Displays like/dislike counts on the watch page below the video description.
* **YouTube Shorts Integration:** Restores dislike counts on the YouTube Shorts sidebar action buttons.
* **Zero Configuration:** Works out-of-the-box using the public Return YouTube Dislike API.
* **Lightweight:** Built with vanilla JavaScript and CSS to minimize browser memory footprint.

<div align="center">
  <img width="485" height="357" alt="image" src="https://github.com/user-attachments/assets/d06ca981-60c1-4fd8-8aff-593fc1291ece" />
  <img width="306" height="328" alt="image" src="https://github.com/user-attachments/assets/f8ba38c6-35c3-4a28-9305-69f5939a5c6e" />
</div>

## 📥 Installation

### 🌐 Chrome Web Store
You can install the extension directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/yt-dislike-preview/ngejddpgnbelgdlbncnmneoodhpgfefd).

### 🛠️ Developer Mode (Manual Installation)
To load the extension locally during development:

1. **Clone this repository:**
   ```bash
   git clone https://github.com/anshupriyan/YT-Dislike-Preview.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** (top-left corner).
5. Select the root folder containing the `manifest.json` file.

## ⚙️ How It Works

* **Content Script (`content.js`):** Injects dislike badges into YouTube's user interface.
* **Background Service Worker (`background.js`):** Interacts with the Return YouTube Dislike API and caches votes in-memory to prevent redundant network requests.

## 💬 Support This Project

* **Discord:** [Join the community](https://discord.gg/9DZxKzxuJc)
* **Buy Me a Chai:** [Support the project via Razorpay](https://razorpay.me/@anshupriyan)

## 📊 Attribution & Data Source

This project retrieves vote data using the public API provided by [Return YouTube Dislike](https://returnyoutubedislike.com/). 

## 🛡️ License

Distributed under the MIT License.
