/**
 * YT Engagement Lens — Content Script
 * Overlays like/dislike badges on YouTube thumbnails.
 * All fetches are delegated to background.js to bypass CORS.
 */
'use strict';

// ─── Config ───────────────────────────────────────────────────────────────────

const DONE_ATTR = 'data-ytel-done';
const BADGE_CLASS = 'ytel-overlay';

const SELECTORS = [
  // Homepage: ytd-rich-item-renderer wraps ytd-rich-grid-media via Shadow DOM,
  // so querySelector('ytd-thumbnail') from ytd-rich-item-renderer returns null.
  // ytd-rich-grid-media is the direct light-DOM parent of ytd-thumbnail.
  'ytd-rich-grid-media',
  'ytd-video-renderer',          // Search results
  'ytd-compact-video-renderer',  // Sidebar suggested
  'ytd-grid-video-renderer',     // Grid / channel page
  'ytd-playlist-video-renderer', // Playlists
  'ytd-reel-item-renderer',      // Shorts shelf
  // Universal fallback: target ytd-thumbnail directly so any missed context
  // is still covered without needing to know the outer container name.
  'ytd-thumbnail',
].join(',');

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {Map<string, object|null>} videoId → API result (null = failed/empty) */
const cache = new Map();

/** @type {Set<string>} videoIds currently in-flight */
const pending = new Set();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/**
 * Extract a YouTube video ID from any anchor inside the container.
 * Checks hrefs first (always in DOM), img src last (lazy-loaded).
 */
function getVideoId(container) {
  for (const a of container.querySelectorAll('a[href]')) {
    let m = a.href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    m = a.href.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  }
  const img = container.querySelector('img[src]');
  if (img) {
    const m = img.src.match(/\/vi(?:_webp)?\/([a-zA-Z0-9_-]{11})\//);
    if (m) return m[1];
  }
  return null;
}

/**
 * Find the element to attach the badge to.
 *
 * WHY ytd-thumbnail (not a#thumbnail):
 * YouTube's own stylesheet applies overflow:hidden to a#thumbnail for rounded
 * corners, which clips any child we append. ytd-thumbnail is the outer custom
 * element — it wraps a#thumbnail, has concrete dimensions, and does NOT have
 * overflow:hidden, so our absolutely-positioned badge stays fully visible.
 */
function getWrapper(container) {
  // If the container IS already ytd-thumbnail, use it directly.
  if (container.tagName?.toLowerCase() === 'ytd-thumbnail') return container;

  // Otherwise look for ytd-thumbnail inside the container.
  // ytd-thumbnail should be in the light DOM of ytd-rich-grid-media /
  // ytd-video-renderer / ytd-compact-video-renderer etc.
  return (
    container.querySelector('ytd-thumbnail') ||
    container.querySelector('a#thumbnail')   ||
    null
  );
}

// ─── Badge rendering ──────────────────────────────────────────────────────────

function renderBadge(wrapper, data) {
  if (wrapper.querySelector(`.${BADGE_CLASS}`)) return; // already rendered

  const likes = data.likes ?? 0;
  const dislikes = data.dislikes ?? 0;
  const total = likes + dislikes;
  const ratio = total > 0 ? Math.round((likes / total) * 100) : null;

  const badge = document.createElement('div');
  badge.className = BADGE_CLASS;

  badge.innerHTML =
    `<span class="ytel-like">👍 ${fmt(likes)}</span>` +
    `<span class="ytel-dislike">👎 ${fmt(dislikes)}</span>` +
    (ratio !== null
      ? `<div class="ytel-bar"><div class="ytel-bar-fill" style="width:${ratio}%"></div></div>`
      : '');

  wrapper.appendChild(badge);
}

// ─── Core processing ──────────────────────────────────────────────────────────

function processContainer(container) {
  if (container.hasAttribute(DONE_ATTR)) return;

  const videoId = getVideoId(container);

  if (!videoId) {
    // Container exists but video ID not yet available — will retry on DOM change
    return;
  }

  container.setAttribute(DONE_ATTR, '1');
  console.log('[YTEL] Found video ID:', videoId);

  const wrapper = getWrapper(container);
  if (!wrapper) {
    console.warn('[YTEL] No wrapper for:', videoId);
    return;
  }

  // Cache hit
  if (cache.has(videoId)) {
    const data = cache.get(videoId);
    if (data) renderBadge(wrapper, data);
    return;
  }

  if (pending.has(videoId)) return;
  pending.add(videoId);

  console.log('[YTEL] Sending message for:', videoId);
  chrome.runtime.sendMessage({ type: 'GET_VOTES', videoId }, (response) => {
    pending.delete(videoId);

    if (chrome.runtime.lastError) {
      console.warn('[YTEL] Message error:', chrome.runtime.lastError.message);
      cache.set(videoId, null);
      return;
    }

    console.log('[YTEL] Response for', videoId, response ? '✓' : '✗ null');
    cache.set(videoId, response ?? null);
    if (response) renderBadge(wrapper, response);
  });
}

function scanAll() {
  document.querySelectorAll(SELECTORS).forEach(processContainer);
}

// ─── MutationObserver — detects new / updated containers ─────────────────────

const mutationObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches?.(SELECTORS)) processContainer(node);
      node.querySelectorAll?.(SELECTORS).forEach(processContainer);
    }

    // Also re-check the target element itself — YouTube sometimes updates
    // existing nodes (e.g. populates href/src after lazy render)
    const t = mutation.target;
    if (t.nodeType === Node.ELEMENT_NODE) {
      const closest = t.closest?.(SELECTORS);
      if (closest && !closest.hasAttribute(DONE_ATTR)) processContainer(closest);
    }
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

function init() {
  scanAll();
  mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'src'] });
}

// YouTube SPA: re-scan after every client-side navigation
document.addEventListener('yt-navigate-finish', () => {
  // Small delay so YouTube's renderer has time to inject thumbnail links
  setTimeout(scanAll, 300);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
