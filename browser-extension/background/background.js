// VibeDev Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('VibeDev Capture extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'capture') {
    // Handle capture request
    handleCapture(sender.tab.id)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function handleCapture(tabId) {
  // Get tab info
  const tab = await chrome.tabs.get(tabId);

  // Execute script to get page context
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    function: getPageContext,
  });

  return {
    tab: {
      url: tab.url,
      title: tab.title,
    },
    context: results[0].result,
  };
}

function getPageContext() {
  return {
    errors: window.__VIBE_ERRORS__ || [],
    networkErrors: window.__VIBE_NETWORK_ERRORS__ || [],
    timestamp: new Date().toISOString(),
  };
}
