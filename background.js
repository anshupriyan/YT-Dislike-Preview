/**
 * YT Dislike Preview — Background Service Worker
 *
 * Handles all fetch() calls to the Return YouTube Dislike API.
 * Content scripts cannot make cross-origin requests without hitting CORS;
 * service workers run in the extension context and bypass that restriction
 * as long as the host is listed in manifest host_permissions.
 */

'use strict';

// ─── In-memory cache (per service-worker lifetime) ────────────────────────────
/** @type {Map<string, object|null>} videoId → API data, or null on failure */
const cache = new Map();

/** @type {Map<string, Promise<object|null>>} videoId → inflight promise */
const inflight = new Map();

const RYD_API = 'https://returnyoutubedislikeapi.com/votes?videoId=';

/**
 * Fetch engagement data for a single video ID.
 * Deduplicates concurrent requests and caches results.
 * @param {string} videoId
 * @returns {Promise<object|null>}
 */
async function getVotes(videoId) {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }
  if (cache.has(videoId)) return cache.get(videoId);
  if (inflight.has(videoId)) return inflight.get(videoId);

  const promise = (async () => {
    try {
      const url = `${RYD_API}${videoId}`;
      console.log('[YTEL-BG] Fetching:', url);

      const resp = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('[YTEL-BG] HTTP', resp.status, 'for', videoId);

      if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status}: ${body.slice(0, 120)}`);
      }

      const data = await resp.json();
      console.log('[YTEL-BG] Data for', videoId, '→ likes:', data.likes, 'dislikes:', data.dislikes);
      cache.set(videoId, data);
      return data;
    } catch (err) {
      console.error('[YTEL-BG] Fetch error for', videoId, '→', err.message);
      cache.set(videoId, null);
      return null;
    } finally {
      inflight.delete(videoId);
    }
  })();

  inflight.set(videoId, promise);
  return promise;
}

// ─── Message handler ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'GET_VOTES' || !message.videoId) return false;

  const videoId = message.videoId;
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    sendResponse(null);
    return false;
  }

  console.log('[YTEL-BG] Received request for', videoId);

  getVotes(videoId).then((data) => {
    console.log('[YTEL-BG] Responding for', videoId, data ? '✓ data' : '✗ null');
    sendResponse(data);
  });
  return true; // Keep channel open for async response
});

// ─── First-Install Onboarding ────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
});

