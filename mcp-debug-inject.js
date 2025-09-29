// MCP Chrome Debug Injection Script
// Script này sẽ được inject vào trang web để thực hiện debug tự động

(function() {
  'use strict';
  
  console.log('🔧 MCP Debug Injection Started');
  
  // Tạo debug panel
  function createDebugPanel() {
    // Kiểm tra xem panel đã tồn tại chưa
    if (document.getElementById('mcp-debug-panel')) {
      return;
    }
    
    const panel = document.createElement('div');
    panel.id = 'mcp-debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: #1a1a1a;
      color: #fff;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 15px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      z-index: 10000;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #4CAF50;">🔧 MCP Debug</h3>
        <button id="mcp-close-panel" style="background: #f44336; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">✕</button>
      </div>
      <div id="mcp-debug-content">
        <div style="margin-bottom: 10px;">
          <button id="mcp-run-accessibility" style="background: #2196F3; color: white; border: none; border-radius: 4px; padding: 6px 12px; margin: 2px; cursor: pointer;">Check Accessibility</button>
        </div>
        <div style="margin-bottom: 10px;">
          <button id="mcp-run-performance" style="background: #FF9800; color: white; border: none; border-radius: 4px; padding: 6px 12px; margin: 2px; cursor: pointer;">Check Performance</button>
        </div>
        <div style="margin-bottom: 10px;">
          <button id="mcp-run-console" style="background: #9C27B0; color: white; border: none; border-radius: 4px; padding: 6px 12px; margin: 2px; cursor: pointer;">Monitor Console</button>
        </div>
        <div style="margin-bottom: 10px;">
          <button id="mcp-run-network" style="background: #607D8B; color: white; border: none; border-radius: 4px; padding: 6px 12px; margin: 2px; cursor: pointer;">Monitor Network</button>
        </div>
        <div id="mcp-results" style="margin-top: 15px; padding: 10px; background: #2a2a2a; border-radius: 4px; max-height: 200px; overflow-y: auto;">
          <div style="color: #888;">Click buttons to run tests...</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Event listeners
    document.getElementById('mcp-close-panel').onclick = () => {
      panel.remove();
    };
    
    document.getElementById('mcp-run-accessibility').onclick = runAccessibilityCheck;
    document.getElementById('mcp-run-performance').onclick = runPerformanceCheck;
    document.getElementById('mcp-run-console').onclick = runConsoleMonitor;
    document.getElementById('mcp-run-network').onclick = runNetworkMonitor;
  }
  
  // Accessibility check
  function runAccessibilityCheck() {
    const results = document.getElementById('mcp-results');
    results.innerHTML = '<div style="color: #4CAF50;">🔍 Running accessibility check...</div>';
    
    const formElements = document.querySelectorAll('input, select, textarea, button');
    const issues = [];
    
    formElements.forEach((element, index) => {
      const issues_found = [];
      
      // Check for missing id/name
      if (!element.id && !element.name) {
        issues_found.push('Missing id/name');
      }
      
      // Check for missing labels
      if ((element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') && !element.labels?.length) {
        const associatedLabel = document.querySelector(`label[for="${element.id}"]`);
        if (!associatedLabel) {
          issues_found.push('Missing label');
        }
      }
      
      // Check for missing aria-label
      if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
        issues_found.push('Missing aria-label');
      }
      
      if (issues_found.length > 0) {
        issues.push({
          element: `${element.tagName}${element.type ? `[${element.type}]` : ''}`,
          issues: issues_found,
          selector: element.id ? `#${element.id}` : element.className ? `.${element.className.split(' ')[0]}` : `${element.tagName.toLowerCase()}:nth-child(${index + 1})`
        });
      }
    });
    
    results.innerHTML = `
      <div style="color: #4CAF50;">✅ Accessibility Check Complete</div>
      <div style="color: #FFC107;">Found ${issues.length} issues:</div>
      ${issues.map(issue => `
        <div style="margin: 5px 0; padding: 5px; background: #3a3a3a; border-radius: 3px;">
          <div style="color: #FF5722;">${issue.element}</div>
          <div style="color: #888; font-size: 11px;">${issue.selector}</div>
          <div style="color: #FFC107; font-size: 11px;">${issue.issues.join(', ')}</div>
        </div>
      `).join('')}
    `;
  }
  
  // Performance check
  function runPerformanceCheck() {
    const results = document.getElementById('mcp-results');
    results.innerHTML = '<div style="color: #FF9800;">⚡ Running performance check...</div>';
    
    const perf = performance.timing;
    const loadTime = perf.loadEventEnd - perf.navigationStart;
    const domReady = perf.domContentLoadedEventEnd - perf.navigationStart;
    
    const memory = performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
    } : null;
    
    results.innerHTML = `
      <div style="color: #FF9800;">⚡ Performance Results</div>
      <div style="margin: 5px 0;">
        <div>Load Time: <span style="color: ${loadTime > 3000 ? '#f44336' : '#4CAF50'}">${loadTime}ms</span></div>
        <div>DOM Ready: <span style="color: ${domReady > 2000 ? '#f44336' : '#4CAF50'}">${domReady}ms</span></div>
        ${memory ? `
          <div>Memory Used: <span style="color: ${memory.used > 50 ? '#f44336' : '#4CAF50'}">${memory.used}MB</span></div>
          <div>Memory Total: ${memory.total}MB</div>
        ` : ''}
      </div>
    `;
  }
  
  // Console monitor
  function runConsoleMonitor() {
    const results = document.getElementById('mcp-results');
    results.innerHTML = '<div style="color: #9C27B0;">📊 Monitoring console (10s)...</div>';
    
    const errors = [];
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = function(...args) {
      errors.push({ type: 'error', message: args.join(' '), time: new Date().toLocaleTimeString() });
      originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
      errors.push({ type: 'warn', message: args.join(' '), time: new Date().toLocaleTimeString() });
      originalWarn.apply(console, args);
    };
    
    setTimeout(() => {
      console.error = originalError;
      console.warn = originalWarn;
      
      results.innerHTML = `
        <div style="color: #9C27B0;">📊 Console Monitor Results</div>
        <div>Captured ${errors.length} messages:</div>
        ${errors.map(error => `
          <div style="margin: 3px 0; padding: 3px; background: #3a3a3a; border-radius: 3px;">
            <span style="color: ${error.type === 'error' ? '#f44336' : '#FFC107'}">[${error.type}]</span>
            <span style="color: #888; font-size: 10px;">${error.time}</span>
            <div style="color: #ccc; font-size: 11px;">${error.message}</div>
          </div>
        `).join('')}
      `;
    }, 10000);
  }
  
  // Network monitor
  function runNetworkMonitor() {
    const results = document.getElementById('mcp-results');
    results.innerHTML = '<div style="color: #607D8B;">🌐 Monitoring network (10s)...</div>';
    
    const requests = [];
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const startTime = Date.now();
      const url = args[0];
      
      try {
        const response = await originalFetch.apply(this, args);
        const duration = Date.now() - startTime;
        
        requests.push({
          url: url.toString().substring(0, 50) + '...',
          status: response.status,
          duration: duration,
          success: response.ok
        });
        
        return response;
      } catch (error) {
        requests.push({
          url: url.toString().substring(0, 50) + '...',
          status: 'Error',
          duration: Date.now() - startTime,
          success: false
        });
        throw error;
      }
    };
    
    setTimeout(() => {
      window.fetch = originalFetch;
      
      results.innerHTML = `
        <div style="color: #607D8B;">🌐 Network Monitor Results</div>
        <div>Captured ${requests.length} requests:</div>
        ${requests.map(req => `
          <div style="margin: 3px 0; padding: 3px; background: #3a3a3a; border-radius: 3px;">
            <div style="color: ${req.success ? '#4CAF50' : '#f44336'}; font-size: 11px;">[${req.status}] ${req.duration}ms</div>
            <div style="color: #ccc; font-size: 10px;">${req.url}</div>
          </div>
        `).join('')}
      `;
    }, 10000);
  }
  
  // Auto-create panel
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createDebugPanel);
  } else {
    createDebugPanel();
  }
  
  // Expose to global scope for MCP
  window.mcpDebug = {
    createDebugPanel,
    runAccessibilityCheck,
    runPerformanceCheck,
    runConsoleMonitor,
    runNetworkMonitor
  };
  
  console.log('✅ MCP Debug Panel Ready!');
})();
