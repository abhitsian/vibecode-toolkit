// VibeDev Content Script
// Intercepts console errors and network failures in real-time

(function() {
  'use strict';

  // Store captured errors
  window.__VIBE_ERRORS__ = window.__VIBE_ERRORS__ || [];
  window.__VIBE_NETWORK_ERRORS__ = window.__VIBE_NETWORK_ERRORS__ || [];

  const MAX_ERRORS = 100; // Limit stored errors

  // Intercept console.error
  const originalError = console.error;
  console.error = function(...args) {
    const errorMessage = args.map(arg => {
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}\n${arg.stack}`;
      }
      return String(arg);
    }).join(' ');

    window.__VIBE_ERRORS__.push({
      type: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    // Keep only last MAX_ERRORS
    if (window.__VIBE_ERRORS__.length > MAX_ERRORS) {
      window.__VIBE_ERRORS__.shift();
    }

    // Call original
    return originalError.apply(console, args);
  };

  // Intercept console.warn
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const warnMessage = args.map(arg => String(arg)).join(' ');

    window.__VIBE_ERRORS__.push({
      type: 'warn',
      message: warnMessage,
      timestamp: new Date().toISOString(),
    });

    if (window.__VIBE_ERRORS__.length > MAX_ERRORS) {
      window.__VIBE_ERRORS__.shift();
    }

    return originalWarn.apply(console, args);
  };

  // Intercept unhandled errors
  window.addEventListener('error', (event) => {
    window.__VIBE_ERRORS__.push({
      type: 'uncaught',
      message: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      timestamp: new Date().toISOString(),
    });

    if (window.__VIBE_ERRORS__.length > MAX_ERRORS) {
      window.__VIBE_ERRORS__.shift();
    }
  });

  // Intercept unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    window.__VIBE_ERRORS__.push({
      type: 'unhandled-rejection',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      timestamp: new Date().toISOString(),
    });

    if (window.__VIBE_ERRORS__.length > MAX_ERRORS) {
      window.__VIBE_ERRORS__.shift();
    }
  });

  // Intercept failed network requests (fetch)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args)
      .then(response => {
        if (!response.ok) {
          window.__VIBE_NETWORK_ERRORS__.push({
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString(),
          });

          if (window.__VIBE_NETWORK_ERRORS__.length > MAX_ERRORS) {
            window.__VIBE_NETWORK_ERRORS__.shift();
          }
        }
        return response;
      })
      .catch(error => {
        window.__VIBE_NETWORK_ERRORS__.push({
          url: args[0],
          error: error.message,
          timestamp: new Date().toISOString(),
        });

        if (window.__VIBE_NETWORK_ERRORS__.length > MAX_ERRORS) {
          window.__VIBE_NETWORK_ERRORS__.shift();
        }

        throw error;
      });
  };

  // Intercept failed network requests (XMLHttpRequest)
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this.__vibe_url = url;
    this.__vibe_method = method;
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    this.addEventListener('load', function() {
      if (this.status >= 400) {
        window.__VIBE_NETWORK_ERRORS__.push({
          url: this.__vibe_url,
          method: this.__vibe_method,
          status: this.status,
          statusText: this.statusText,
          timestamp: new Date().toISOString(),
        });

        if (window.__VIBE_NETWORK_ERRORS__.length > MAX_ERRORS) {
          window.__VIBE_NETWORK_ERRORS__.shift();
        }
      }
    });

    this.addEventListener('error', function() {
      window.__VIBE_NETWORK_ERRORS__.push({
        url: this.__vibe_url,
        method: this.__vibe_method,
        error: 'Network request failed',
        timestamp: new Date().toISOString(),
      });

      if (window.__VIBE_NETWORK_ERRORS__.length > MAX_ERRORS) {
        window.__VIBE_NETWORK_ERRORS__.shift();
      }
    });

    return originalSend.apply(this, args);
  };

  console.log('%c[VibeDev]%c Capture extension loaded - errors will be tracked',
    'background: #667eea; color: white; padding: 2px 5px; border-radius: 3px;',
    'color: #888;'
  );
})();
