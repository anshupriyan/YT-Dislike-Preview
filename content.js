<<<<<<< HEAD
'use strict';

const BADGE_CLASS = 'ytel-overlay';
const DONE_ATTR = 'data-ytel-done';
const DISLIKE_CLASS = 'ytel-watch-dislike';

const SELECTORS = [
  'ytd-rich-item-renderer',          // HOME FEED
  'ytd-video-renderer',              // Search results
  'ytd-compact-video-renderer',      // Sidebar / watch next
  'ytd-grid-video-renderer',         // Channel pages
  'ytd-playlist-video-renderer',     // Playlists
  'ytd-reel-item-renderer',          // Shorts
].join(',');

const cache = new Map();
const pending = new Set();

=======
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

>>>>>>> 7c24cd50a7265e0745c014d1259cb3031a68d641
function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

<<<<<<< HEAD
function getVideoId(el) {
  for (const a of el.querySelectorAll('a[href]')) {
    const m = a.href.match(/(?:[?&]v=|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  }
  const img = el.querySelector('img[src]');
=======
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
>>>>>>> 7c24cd50a7265e0745c014d1259cb3031a68d641
  if (img) {
    const m = img.src.match(/\/vi(?:_webp)?\/([a-zA-Z0-9_-]{11})\//);
    if (m) return m[1];
  }
  return null;
}

<<<<<<< HEAD
// Detect mix/playlist cards — skip these
function isPlaylistOrMix(el) {
  for (const a of el.querySelectorAll('a[href]')) {
    if (/[?&]list=/.test(a.href)) return true;
  }
  return false;
}

// Find the metadata row to inject stats inline.
function getMetaLine(container) {
  // Shorts home feed items — find the subtitle/views area below the thumbnail
  if (container.matches?.('ytd-reel-item-renderer')) {
    return (
      container.querySelector('#details') ||
      container.querySelector('.ytReelItemRendererSubtitle') ||
      container.querySelector('#metadata') ||
      null
    );
  }

  return (
    container.querySelector('div.ytContentMetadataViewModelMetadataRow') ||  // home feed
    container.querySelector('#metadata-line') ||                             // search / sidebar
    container.querySelector('yt-lockup-view-model') ||                       // home fallback
    container.querySelector('#content') ||                                    // older fallback
=======
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
>>>>>>> 7c24cd50a7265e0745c014d1259cb3031a68d641
    null
  );
}

<<<<<<< HEAD
function makeBadge(data) {
  const likes = data.likes ?? 0;
  const dislikes = data.dislikes ?? 0;

  const wrap = document.createElement('span');
  wrap.className = BADGE_CLASS;
  wrap.textContent = ' • ';

  const ls = document.createElement('span');
  ls.className = 'ytel-like';
  ls.textContent = '👍 ' + fmt(likes);

  const ds = document.createElement('span');
  ds.className = 'ytel-dislike';
  ds.textContent = ' 👎 ' + fmt(dislikes);

  wrap.appendChild(ls);
  wrap.appendChild(ds);
  return wrap;
}

function showBadge(container, data) {
  const meta = getMetaLine(container);
  if (!meta) return;
  meta.querySelectorAll('.' + BADGE_CLASS).forEach(b => b.remove());
  meta.appendChild(makeBadge(data));
}

function processContainer(container) {
  // Skip playlists and mixes — their stats would be misleading
  if (isPlaylistOrMix(container)) return;

  const videoId = getVideoId(container);
  if (!videoId) return;

  // Already processed same video — restore badge if missing
  if (container.getAttribute(DONE_ATTR) === videoId) {
    const meta = getMetaLine(container);
    if (meta && !meta.querySelector('.' + BADGE_CLASS)) {
      const data = cache.get(videoId);
      if (data) showBadge(container, data);
    }
    return;
  }

  container.setAttribute(DONE_ATTR, videoId);

  if (cache.has(videoId)) {
    const data = cache.get(videoId);
    if (data) showBadge(container, data);
=======
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
>>>>>>> 7c24cd50a7265e0745c014d1259cb3031a68d641
    return;
  }

  if (pending.has(videoId)) return;
  pending.add(videoId);

<<<<<<< HEAD
  chrome.runtime.sendMessage({ type: 'GET_VOTES', videoId }, (resp) => {
    pending.delete(videoId);
    if (chrome.runtime.lastError) {
      container.removeAttribute(DONE_ATTR);
      return;
    }
    cache.set(videoId, resp ?? null);
    if (resp) showBadge(container, resp);
  });
}

// ─── WATCH PAGE: Dislike count on the main video ─────────────────────────────

let lastWatchVideoId = null;

function getWatchVideoId() {
  const m = location.href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function injectWatchDislike(data) {
  // Remove any existing injection
  document.querySelectorAll('.' + DISLIKE_CLASS).forEach(el => el.remove());

  const dislikes = data.dislikes ?? 0;
  const likes = data.likes ?? 0;

  const countEl = document.createElement('span');
  countEl.className = DISLIKE_CLASS;

  const likeSpan = document.createElement('span');
  likeSpan.className = 'ytel-like';
  likeSpan.textContent = '👍 ' + fmt(likes);

  const dislikeSpan = document.createElement('span');
  dislikeSpan.className = 'ytel-dislike';
  dislikeSpan.textContent = '👎 ' + fmt(dislikes);

  countEl.appendChild(document.createTextNode('•  '));
  countEl.appendChild(likeSpan);
  countEl.appendChild(document.createTextNode('   '));
  countEl.appendChild(dislikeSpan);

  // Place after the views/date line as its own block row
  const watchInfo = document.querySelector('ytd-watch-info-text');
  if (watchInfo) {
    watchInfo.insertAdjacentElement('afterend', countEl);
    return;
  }

  // Fallback
  const infoCont = document.querySelector('#info-container');
  if (infoCont) {
    infoCont.insertAdjacentElement('afterend', countEl);
  }
}

function processWatchPage() {
  const videoId = getWatchVideoId();
  if (!videoId || videoId === lastWatchVideoId) {
    if (videoId && !document.querySelector('.' + DISLIKE_CLASS)) {
      const data = cache.get(videoId);
      if (data) injectWatchDislike(data);
    }
    return;
  }

  lastWatchVideoId = videoId;

  if (cache.has(videoId)) {
    const data = cache.get(videoId);
    if (data) injectWatchDislike(data);
    return;
  }

  chrome.runtime.sendMessage({ type: 'GET_VOTES', videoId }, (resp) => {
    if (chrome.runtime.lastError) return;
    cache.set(videoId, resp ?? null);
    if (resp) injectWatchDislike(resp);
  });
}

// ─── SCANNING ────────────────────────────────────────────────────────────────

const SHORTS_DISLIKE_CLASS = 'ytel-shorts-dislike';
let lastShortsVideoId = null;

function getShortsVideoId() {
  const m = location.href.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function injectShortsDislike(data) {
  // Remove any existing injection
  document.querySelectorAll('.' + SHORTS_DISLIKE_CLASS).forEach(el => el.remove());

  const dislikes = data.dislikes ?? 0;

  const countEl = document.createElement('span');
  countEl.className = SHORTS_DISLIKE_CLASS;
  countEl.textContent = fmt(dislikes);

  // Find the "Dislike" label span inside the shorts action buttons.
  // It lives in: DIV.ytSpecButtonShapeWithLabelLabel > SPAN.ytAttributedStringHost
  // We need to find the one containing exactly "Dislike" text.
  const labelDivs = document.querySelectorAll('div.ytSpecButtonShapeWithLabelLabel');
  for (const div of labelDivs) {
    const span = div.querySelector('span.ytAttributedStringHost');
    if (span && span.textContent.trim() === 'Dislike') {
      span.textContent = '';
      span.appendChild(countEl);
      return;
    }
  }
}

function processShortsPage() {
  const videoId = getShortsVideoId();
  if (!videoId) return;

  if (videoId === lastShortsVideoId) {
    if (!document.querySelector('.' + SHORTS_DISLIKE_CLASS)) {
      const data = cache.get(videoId);
      if (data) injectShortsDislike(data);
    }
    return;
  }

  lastShortsVideoId = videoId;

  if (cache.has(videoId)) {
    const data = cache.get(videoId);
    if (data) injectShortsDislike(data);
    return;
  }

  chrome.runtime.sendMessage({ type: 'GET_VOTES', videoId }, (resp) => {
    if (chrome.runtime.lastError) return;
    cache.set(videoId, resp ?? null);
    if (resp) injectShortsDislike(resp);
=======
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
>>>>>>> 7c24cd50a7265e0745c014d1259cb3031a68d641
  });
}

function scanAll() {
<<<<<<< HEAD
  // Thumbnail badges (home, search, sidebar)
  const containers = document.querySelectorAll(SELECTORS);
  containers.forEach(processContainer);

  // Sidebar recommendations (watch page) — these use yt-lockup-view-model
  // directly, not wrapped in ytd-compact-video-renderer anymore
  if (location.pathname === '/watch') {
    const sidebar = document.querySelector('ytd-watch-next-secondary-results-renderer');
    if (sidebar) {
      sidebar.querySelectorAll('yt-lockup-view-model').forEach(lockup => {
        // Skip if already inside a processed SELECTORS container
        if (lockup.closest(SELECTORS)) return;
        processSidebarCard(lockup);
      });
    }
    processWatchPage();
  }

  // Shorts page
  if (location.pathname.startsWith('/shorts/')) {
    processShortsPage();
  }
}

// Process a sidebar yt-lockup-view-model card
function processSidebarCard(lockup) {
  const videoId = getVideoId(lockup);
  if (!videoId) return;
  if (isPlaylistOrMix(lockup)) return;

  if (lockup.getAttribute(DONE_ATTR) === videoId) {
    // Restore badge if missing
    const meta = lockup.querySelector('div.ytContentMetadataViewModelMetadataRow') ||
                 lockup.querySelector('yt-lockup-metadata-view-model');
    if (meta && !meta.querySelector('.' + BADGE_CLASS)) {
      const data = cache.get(videoId);
      if (data) {
        meta.querySelectorAll('.' + BADGE_CLASS).forEach(b => b.remove());
        meta.appendChild(makeBadge(data));
      }
    }
    return;
  }

  lockup.setAttribute(DONE_ATTR, videoId);

  const mount = lockup.querySelector('div.ytContentMetadataViewModelMetadataRow') ||
                lockup.querySelector('yt-lockup-metadata-view-model') ||
                lockup;

  if (cache.has(videoId)) {
    const data = cache.get(videoId);
    if (data) {
      mount.querySelectorAll('.' + BADGE_CLASS).forEach(b => b.remove());
      mount.appendChild(makeBadge(data));
    }
    return;
  }

  if (pending.has(videoId)) return;
  pending.add(videoId);

  chrome.runtime.sendMessage({ type: 'GET_VOTES', videoId }, (resp) => {
    pending.delete(videoId);
    if (chrome.runtime.lastError) {
      lockup.removeAttribute(DONE_ATTR);
      return;
    }
    cache.set(videoId, resp ?? null);
    if (resp) {
      mount.querySelectorAll('.' + BADGE_CLASS).forEach(b => b.remove());
      mount.appendChild(makeBadge(resp));
    }
  });
}

const obs = new MutationObserver((muts) => {
  for (const m of muts) {
    for (const node of m.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches?.(SELECTORS)) processContainer(node);
      node.querySelectorAll?.(SELECTORS).forEach(processContainer);
    }
    if (m.target.nodeType === 1) {
      const c = m.target.closest?.(SELECTORS);
      if (c) processContainer(c);
=======
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
>>>>>>> 7c24cd50a7265e0745c014d1259cb3031a68d641
    }
  }
});

<<<<<<< HEAD
function init() {
  scanAll();
  obs.observe(document.body, {
    childList: true, subtree: true,
    attributes: true, attributeFilter: ['href', 'src'],
  });
  setInterval(scanAll, 1000);
  window.addEventListener('scroll', () => setTimeout(scanAll, 150), { passive: true });
}

document.addEventListener('yt-navigate-finish', () => {
  document.querySelectorAll('[' + DONE_ATTR + ']').forEach(el => el.removeAttribute(DONE_ATTR));
  lastWatchVideoId = null;
  lastShortsVideoId = null;
  window._ytelShortsDumped = false;
  setTimeout(scanAll, 400);
  setTimeout(scanAll, 1200);
=======
// ─── Boot ─────────────────────────────────────────────────────────────────────

function init() {
  scanAll();
  mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'src'] });
}

// YouTube SPA: re-scan after every client-side navigation
document.addEventListener('yt-navigate-finish', () => {
  // Small delay so YouTube's renderer has time to inject thumbnail links
  setTimeout(scanAll, 300);
>>>>>>> 7c24cd50a7265e0745c014d1259cb3031a68d641
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
