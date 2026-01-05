import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';

interface CaptureStats {
  total: number;
  today: number;
  resolved: number;
}

function App() {
  const [activeView, setActiveView] = useState<'home' | 'captures' | 'settings'>('home');
  const [stats, setStats] = useState<CaptureStats>({
    total: 0,
    today: 0,
    resolved: 0,
  });
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    // Load stats on mount
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await invoke<CaptureStats>('get_capture_stats');
      setStats(result);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleQuickCapture = async () => {
    setCapturing(true);
    try {
      await invoke('quick_capture', { description: 'Quick capture' });
      await loadStats();
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setCapturing(false);
    }
  };

  const handleScreenshot = async () => {
    try {
      await invoke('take_screenshot');
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      await invoke('start_recording');
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🎸</span>
          <span className="logo-text">VibeDev</span>
        </div>
        <div className="close-btn" onClick={() => invoke('hide_window')}>×</div>
      </header>

      <nav className="nav">
        <button
          className={`nav-btn ${activeView === 'home' ? 'active' : ''}`}
          onClick={() => setActiveView('home')}
        >
          Home
        </button>
        <button
          className={`nav-btn ${activeView === 'captures' ? 'active' : ''}`}
          onClick={() => setActiveView('captures')}
        >
          Captures
        </button>
        <button
          className={`nav-btn ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveView('settings')}
        >
          Settings
        </button>
      </nav>

      {activeView === 'home' && (
        <main className="content">
          <div className="stats">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Captures</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.today}</div>
              <div className="stat-label">Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          <div className="actions">
            <button
              className="action-btn primary"
              onClick={handleQuickCapture}
              disabled={capturing}
            >
              <span className="action-icon">⚡</span>
              <span className="action-text">
                {capturing ? 'Capturing...' : 'Quick Capture'}
              </span>
              <span className="action-hotkey">⌘⇧V</span>
            </button>

            <button className="action-btn" onClick={handleScreenshot}>
              <span className="action-icon">📸</span>
              <span className="action-text">Screenshot</span>
              <span className="action-hotkey">⌘⇧S</span>
            </button>

            <button className="action-btn" onClick={handleStartRecording}>
              <span className="action-icon">🎥</span>
              <span className="action-text">Start Recording</span>
              <span className="action-hotkey">⌘⇧R</span>
            </button>
          </div>

          <div className="recent">
            <h3>Recent Captures</h3>
            <div className="recent-list">
              <div className="recent-item">
                <div className="recent-icon">🐛</div>
                <div className="recent-info">
                  <div className="recent-title">No captures yet</div>
                  <div className="recent-time">Press ⌘⇧V to start</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {activeView === 'captures' && (
        <main className="content">
          <h2>All Captures</h2>
          <p className="placeholder">Your captures will appear here</p>
        </main>
      )}

      {activeView === 'settings' && (
        <main className="content">
          <h2>Settings</h2>
          <div className="settings">
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Auto-capture on errors
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Include screenshots
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" />
                Video buffer (30s)
              </label>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
