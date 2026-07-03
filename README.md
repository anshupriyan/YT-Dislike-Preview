# 📊 YT Dislike Preview

A lightweight, Manifest V3 Chrome Extension that displays YouTube video engagement metrics (likes, dislikes, and ratios) directly on thumbnails, the main video player, and YouTube Shorts — **no API key required.**

## ✨ Features

*   **Thumbnail Overlays:** View like/dislike counts right on the home feed, search results, sidebar recommendations, channel pages, and playlist grids.
*   **Watch Page Metrics:** Displays the exact like/dislike counts under the main video description.
*   **YouTube Shorts Integration:** Restores the dislike counts on YouTube Shorts action buttons.
*   **No API Keys Needed:** Works out-of-the-box using the public Return YouTube Dislike API.
*   **Lightweight & Fast:** Built with pure vanilla JavaScript and CSS to minimize browser memory footprint.

## 🛠️ Installation (Developer Mode)

Since this extension is not yet on the Chrome Web Store, you can load it locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anshupriyan/YT-Dislike-Preview.git
    ```
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** (toggle in the top-right corner).
4.  Click **Load unpacked** in the top-left corner.
5.  Select the `YT-Dislike-Preview` folder containing the `manifest.json` file.

## ⚙️ How It Works

This extension interacts with YouTube's page structure via content scripts (`content.js`) and retrieves historical dislike and like data through background requests.

## 📊 Attribution & Data Source

This project uses the public API provided by [Return YouTube Dislike](https://returnyoutubedislike.com/). We would like to attribute and thank the Return YouTube Dislike project and its contributors for their excellent work and for making this data available. 

*   **Website:** [returnyoutubedislike.com](https://returnyoutubedislike.com/)
*   **Source Code:** [Anarios/return-youtube-dislike on GitHub](https://github.com/Anarios/return-youtube-dislike)

## 🛡️ License

Distributed under the MIT License.

