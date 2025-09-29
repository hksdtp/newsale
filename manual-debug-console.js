// Manual Debug Console Script
// Copy và paste script này vào browser console để debug

console.log('🚀 Manual Debug Console Started');

// 1. Accessibility Check
function checkAccessibility() {
  console.log('🔍 Running Accessibility Check...');

  const formElements = document.querySelectorAll('input, select, textarea, button');
  const issues = [];

  formElements.forEach((element, index) => {
    const problems = [];

    // Check for missing id/name
    if (!element.id && !element.name) {
      problems.push('Missing id/name');
    }

    // Check for missing labels
    if (
      (element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA') &&
      !element.labels?.length
    ) {
      const associatedLabel = document.querySelector(`label[for="${element.id}"]`);
      if (!associatedLabel) {
        problems.push('Missing label');
      }
    }

    // Check for missing aria-label
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      problems.push('Missing aria-label');
    }

    // Check autocomplete for password fields
    if (element.type === 'password' && !element.getAttribute('autocomplete')) {
      problems.push('Missing autocomplete attribute');
    }

    if (problems.length > 0) {
      issues.push({
        element: `${element.tagName}${element.type ? `[${element.type}]` : ''}`,
        problems: problems,
        selector: element.id
          ? `#${element.id}`
          : element.className
            ? `.${element.className.split(' ')[0]}`
            : `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
        // Remove elementRef to avoid circular reference in JSON.stringify
      });
    }
  });

  console.log(`🔍 Accessibility Issues Found: ${issues.length}`);
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.element} (${issue.selector}):`, issue.problems);
  });

  return issues;
}

// 2. Performance Check
function checkPerformance() {
  console.log('⚡ Running Performance Check...');

  const perf = performance.timing;
  const loadTime = perf.loadEventEnd - perf.navigationStart;
  const domReady = perf.domContentLoadedEventEnd - perf.navigationStart;

  const memory = performance.memory
    ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      }
    : null;

  const perfData = {
    loadTime: loadTime,
    domReady: domReady,
    memory: memory,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  console.log('⚡ Performance Data:');
  console.log(`   Load Time: ${loadTime}ms ${loadTime > 3000 ? '❌ SLOW' : '✅ OK'}`);
  console.log(`   DOM Ready: ${domReady}ms ${domReady > 2000 ? '❌ SLOW' : '✅ OK'}`);
  if (memory) {
    console.log(
      `   Memory Used: ${memory.used}MB / ${memory.total}MB ${memory.used > 50 ? '⚠️ HIGH' : '✅ OK'}`
    );
  }

  return perfData;
}

// 3. Console Error Monitor
function startConsoleMonitor(duration = 30000) {
  console.log(`📊 Starting Console Monitor for ${duration / 1000} seconds...`);

  const originalError = console.error;
  const originalWarn = console.warn;
  const errors = [];

  console.error = function (...args) {
    errors.push({
      type: 'error',
      message: args.join(' '),
      time: new Date().toISOString(),
      stack: new Error().stack,
    });
    originalError.apply(console, args);
  };

  console.warn = function (...args) {
    errors.push({
      type: 'warn',
      message: args.join(' '),
      time: new Date().toISOString(),
    });
    originalWarn.apply(console, args);
  };

  setTimeout(() => {
    console.error = originalError;
    console.warn = originalWarn;

    console.log(`📊 Console Monitor Results: ${errors.length} messages captured`);
    errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.type.toUpperCase()}] ${error.time}: ${error.message}`);
    });

    return errors;
  }, duration);

  return errors;
}

// 4. Network Monitor
function startNetworkMonitor(duration = 30000) {
  console.log(`🌐 Starting Network Monitor for ${duration / 1000} seconds...`);

  const requests = [];
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const startTime = Date.now();
    const url = args[0];

    try {
      const response = await originalFetch.apply(this, args);
      const duration = Date.now() - startTime;

      requests.push({
        url: url.toString(),
        method: args[1]?.method || 'GET',
        status: response.status,
        duration: duration,
        success: response.ok,
        time: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      requests.push({
        url: url.toString(),
        method: args[1]?.method || 'GET',
        status: 'Error',
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        time: new Date().toISOString(),
      });
      throw error;
    }
  };

  setTimeout(() => {
    window.fetch = originalFetch;

    console.log(`🌐 Network Monitor Results: ${requests.length} requests captured`);
    requests.forEach((req, index) => {
      const status = req.success ? '✅' : '❌';
      console.log(
        `${index + 1}. ${status} ${req.method} ${req.url} - ${req.status} (${req.duration}ms)`
      );
    });

    return requests;
  }, duration);

  return requests;
}

// 5. React Error Detection
function checkReactErrors() {
  console.log('⚛️ Checking for React Errors...');

  // Check for React DevTools
  const hasReactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  console.log(`React DevTools: ${hasReactDevTools ? '✅ Available' : '❌ Not found'}`);

  // Check for React in window
  const hasReact = window.React;
  console.log(`React: ${hasReact ? '✅ Available' : '❌ Not found'}`);

  // Check for common React error patterns in DOM
  const errorBoundaries = document.querySelectorAll('[data-reactroot] *').length;
  console.log(`React Components: ${errorBoundaries} elements found`);

  return {
    hasReactDevTools,
    hasReact,
    componentCount: errorBoundaries,
  };
}

// 6. TaskService Debug (specific to this app)
function debugTaskService() {
  console.log('📋 Debugging TaskService...');

  // Check if taskService is available
  if (window.taskService) {
    console.log('✅ TaskService found in window');
  } else {
    console.log('❌ TaskService not found in window');
  }

  // Check localStorage for debug data
  const debugResults = localStorage.getItem('debugResults');
  if (debugResults) {
    console.log('📊 Previous debug results found:', JSON.parse(debugResults));
  }

  // Check for Supabase connection
  if (window.supabase) {
    console.log('✅ Supabase client found');
  } else {
    console.log('❌ Supabase client not found');
  }

  return {
    hasTaskService: !!window.taskService,
    hasSupabase: !!window.supabase,
    hasDebugResults: !!debugResults,
  };
}

// 7. Complete Debug Run
function runCompleteDebug() {
  console.log('🚀 Running Complete Debug Analysis...');
  console.log('=====================================');

  const results = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    accessibility: checkAccessibility(),
    performance: checkPerformance(),
    react: checkReactErrors(),
    taskService: debugTaskService(),
  };

  // Start monitoring
  startConsoleMonitor(30000);
  startNetworkMonitor(30000);

  // Store results
  localStorage.setItem('completeDebugResults', JSON.stringify(results));

  console.log('📊 Complete Debug Results:', results);
  console.log('✅ Debug analysis complete! Results stored in localStorage.');
  console.log('🔍 Monitoring console and network for 30 seconds...');

  return results;
}

// Expose functions globally
window.debugConsole = {
  checkAccessibility,
  checkPerformance,
  startConsoleMonitor,
  startNetworkMonitor,
  checkReactErrors,
  debugTaskService,
  runCompleteDebug,
};

console.log('✅ Manual Debug Console Ready!');
console.log('📋 Available commands:');
console.log('   debugConsole.checkAccessibility()');
console.log('   debugConsole.checkPerformance()');
console.log('   debugConsole.startConsoleMonitor()');
console.log('   debugConsole.startNetworkMonitor()');
console.log('   debugConsole.checkReactErrors()');
console.log('   debugConsole.debugTaskService()');
console.log('   debugConsole.runCompleteDebug()');
console.log('');
console.log('🚀 Quick start: debugConsole.runCompleteDebug()');

// Auto-run complete debug
runCompleteDebug();
