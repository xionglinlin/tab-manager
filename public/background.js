/**
 * background.js — Service Worker for Tab Manager
 *
 * Chrome's "always-on" background script for Tab Manager.
 * Its jobs:
 * 1. Keep the toolbar badge showing the current open tab count.
 * 2. Handle extension icon click to open the management page.
 * 3. Listen for tab events to update badge in real-time.
 */

// ─── Badge updater ────────────────────────────────────────────────────────────

/**
 * updateBadge()
 *
 * Counts open real-web tabs and updates the extension's toolbar badge.
 * "Real" tabs = not chrome://, not extension pages, not about:blank.
 */
async function updateBadge() {
  try {
    const tabs = await chrome.tabs.query({});

    // Only count actual web pages — skip browser internals and extension pages
    const count = tabs.filter(t => {
      const url = t.url || '';
      return (
        !url.startsWith('chrome://') &&
        !url.startsWith('chrome-extension://') &&
        !url.startsWith('moz-extension://') &&
        !url.startsWith('resource://') &&
        !url.startsWith('about:') &&
        !url.startsWith('edge://') &&
        !url.startsWith('brave://')
      );
    }).length;

    // Don't show "0" — an empty badge is cleaner
    await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });

    if (count === 0) return;

    // Pick badge color based on workload level
    let color;
    if (count <= 10) {
      color = '#4ade80'; // Green — you're in control
    } else if (count <= 20) {
      color = '#fbbf24'; // Amber — things are piling up
    } else {
      color = '#f87171'; // Red — time to focus and close some tabs
    }

    await chrome.action.setBadgeBackgroundColor({ color });

  } catch {
    // If something goes wrong, clear the badge rather than show stale data
    chrome.action.setBadgeText({ text: '' });
  }
}

// ─── Event listeners ──────────────────────────────────────────────────────────

// Update badge when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});

// Update badge when Chrome starts up
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

// Update badge whenever a tab is opened
chrome.tabs.onCreated.addListener(() => {
  updateBadge();
});

// Update badge whenever a tab is closed
chrome.tabs.onRemoved.addListener(() => {
  updateBadge();
});

// Update badge when a tab's URL changes (e.g. navigating to/from chrome://)
chrome.tabs.onUpdated.addListener(() => {
  updateBadge();
});

// ─── Initial run ─────────────────────────────────────────────────────────────

// Run once immediately when the service worker first loads
updateBadge();

// ─── Action listener (Standalone Tab Mode) ───────────────────────────────────

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('index.html');

  try {
    // Check if Tab Manager management page is already open
    const tabs = await chrome.tabs.query({ url: url });

    if (tabs.length > 0) {
      // It exists, bring it to the front
      const tab = tabs[0];
      await chrome.windows.update(tab.windowId, { focused: true });
      await chrome.tabs.update(tab.id, { active: true });
    } else {
      // It doesn't exist, create a new one
      await chrome.tabs.create({ url: url });
    }
  } catch (error) {
    console.error('Failed to open/focus Tab Manager page:', error);
    // Fallback: try creating a new tab anyway if querying failed
    chrome.tabs.create({ url: url });
  }
});
