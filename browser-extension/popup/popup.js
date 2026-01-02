let capturedData = null;

document.getElementById('captureBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const outputEl = document.getElementById('output');
  const infoEl = document.getElementById('info');
  const copyBtn = document.getElementById('copyBtn');
  const captureBtn = document.getElementById('captureBtn');

  try {
    captureBtn.disabled = true;
    captureBtn.textContent = 'Capturing...';

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject and execute content script to capture console logs
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: capturePageContext,
    });

    const pageContext = results[0].result;

    // Build the capture report
    const report = buildReport(pageContext, tab);
    capturedData = report;

    // Display success
    statusEl.className = 'status success';
    statusEl.textContent = 'Bug context captured successfully!';

    // Show output
    outputEl.textContent = report;
    outputEl.classList.add('show');

    // Show info
    infoEl.style.display = 'block';
    document.getElementById('infoContent').innerHTML = `
      <div class="info-item">
        <span class="label">URL:</span>
        <span class="value">${new URL(tab.url).hostname}</span>
      </div>
      <div class="info-item">
        <span class="label">Console Errors:</span>
        <span class="value">${pageContext.consoleErrors.length}</span>
      </div>
      <div class="info-item">
        <span class="label">Network Errors:</span>
        <span class="value">${pageContext.networkErrors.length}</span>
      </div>
      <div class="info-item">
        <span class="label">Storage:</span>
        <span class="value">${Object.keys(pageContext.localStorage).length} items</span>
      </div>
    `;

    // Show copy button
    copyBtn.style.display = 'block';

  } catch (error) {
    statusEl.className = 'status error';
    statusEl.textContent = `Error: ${error.message}`;
  } finally {
    captureBtn.disabled = false;
    captureBtn.textContent = 'Capture Bug Context';
  }
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  if (!capturedData) return;

  try {
    await navigator.clipboard.writeText(capturedData);
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy to Clipboard';
    }, 2000);
  } catch (error) {
    alert('Failed to copy: ' + error.message);
  }
});

// This function runs in the page context
function capturePageContext() {
  const consoleErrors = [];
  const networkErrors = [];

  // Capture existing console errors from the page
  // Note: This is a simplified version. In production, you'd need to
  // intercept console methods earlier via content script

  // Try to get errors from window if they're being tracked
  if (window.__VIBE_ERRORS__) {
    consoleErrors.push(...window.__VIBE_ERRORS__);
  }

  // Get localStorage
  const localStorage = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      localStorage[key] = window.localStorage.getItem(key);
    }
  } catch (e) {
    // localStorage might be blocked
  }

  // Get sessionStorage
  const sessionStorage = {};
  try {
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      sessionStorage[key] = window.sessionStorage.getItem(key);
    }
  } catch (e) {
    // sessionStorage might be blocked
  }

  // Get DOM info
  const domInfo = {
    title: document.title,
    readyState: document.readyState,
    referrer: document.referrer,
  };

  return {
    url: window.location.href,
    consoleErrors,
    networkErrors,
    localStorage,
    sessionStorage,
    domInfo,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}

function buildReport(pageContext, tab) {
  const lines = [];

  lines.push('# Bug Report - Browser Context\n');
  lines.push(`**Generated:** ${new Date().toLocaleString()}\n`);
  lines.push('---\n');

  lines.push('## Page Information\n');
  lines.push(`- **URL:** ${pageContext.url}`);
  lines.push(`- **Title:** ${pageContext.domInfo.title}`);
  lines.push(`- **User Agent:** ${pageContext.userAgent}`);
  lines.push('');

  if (pageContext.consoleErrors.length > 0) {
    lines.push('## Console Errors\n');
    lines.push('```');
    pageContext.consoleErrors.forEach(error => {
      lines.push(error);
    });
    lines.push('```');
    lines.push('');
  } else {
    lines.push('## Console Errors\n');
    lines.push('No console errors captured.\n');
    lines.push('*Note: Console errors must be captured by the content script in real-time.*\n');
  }

  if (Object.keys(pageContext.localStorage).length > 0) {
    lines.push('## Local Storage\n');
    lines.push('```json');
    lines.push(JSON.stringify(pageContext.localStorage, null, 2));
    lines.push('```');
    lines.push('');
  }

  if (Object.keys(pageContext.sessionStorage).length > 0) {
    lines.push('## Session Storage\n');
    lines.push('```json');
    lines.push(JSON.stringify(pageContext.sessionStorage, null, 2));
    lines.push('```');
    lines.push('');
  }

  lines.push('---');
  lines.push('*Generated by VibeDev Toolkit Browser Extension*');

  return lines.join('\n');
}
