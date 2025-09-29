// Chrome MCP Debug Automation Script
// Sử dụng script này để test các tính năng debug tự động

console.log('🚀 Chrome MCP Debug Automation Started');

// Test 1: Kiểm tra accessibility issues
async function testAccessibility() {
  console.log('🔍 Testing Accessibility...');
  
  // Tìm tất cả form elements thiếu id/name
  const formElements = document.querySelectorAll('input, select, textarea');
  const missingAttributes = [];
  
  formElements.forEach((element, index) => {
    if (!element.id && !element.name) {
      missingAttributes.push({
        tagName: element.tagName,
        type: element.type || 'N/A',
        index: index,
        element: element
      });
    }
  });
  
  console.log(`❌ Found ${missingAttributes.length} elements missing id/name:`, missingAttributes);
  return missingAttributes;
}

// Test 2: Kiểm tra console errors
async function testConsoleErrors() {
  console.log('🔍 Testing Console Errors...');
  
  // Lắng nghe console errors
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push({
      timestamp: new Date().toISOString(),
      message: args.join(' ')
    });
    originalError.apply(console, args);
  };
  
  // Restore sau 5 giây
  setTimeout(() => {
    console.error = originalError;
    console.log(`📊 Captured ${errors.length} console errors:`, errors);
  }, 5000);
  
  return errors;
}

// Test 3: Kiểm tra network requests
async function testNetworkRequests() {
  console.log('🔍 Testing Network Requests...');
  
  // Monitor fetch requests
  const originalFetch = window.fetch;
  const requests = [];
  
  window.fetch = async function(...args) {
    const startTime = Date.now();
    const url = args[0];
    
    try {
      const response = await originalFetch.apply(this, args);
      const endTime = Date.now();
      
      requests.push({
        url: url,
        status: response.status,
        duration: endTime - startTime,
        success: response.ok
      });
      
      return response;
    } catch (error) {
      requests.push({
        url: url,
        error: error.message,
        duration: Date.now() - startTime,
        success: false
      });
      throw error;
    }
  };
  
  // Restore sau 10 giây
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log(`📊 Captured ${requests.length} network requests:`, requests);
  }, 10000);
  
  return requests;
}

// Test 4: Kiểm tra performance
async function testPerformance() {
  console.log('🔍 Testing Performance...');
  
  const performanceData = {
    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    firstPaint: 0,
    memoryUsage: performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    } : null
  };
  
  // Get First Paint if available
  if (performance.getEntriesByType) {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    if (firstPaint) {
      performanceData.firstPaint = firstPaint.startTime;
    }
  }
  
  console.log('📊 Performance Data:', performanceData);
  return performanceData;
}

// Test 5: Kiểm tra React errors
async function testReactErrors() {
  console.log('🔍 Testing React Errors...');
  
  // Tìm React error boundaries
  const reactErrors = [];
  
  // Override React error handling nếu có
  if (window.React && window.React.Component) {
    const originalComponentDidCatch = window.React.Component.prototype.componentDidCatch;
    
    window.React.Component.prototype.componentDidCatch = function(error, errorInfo) {
      reactErrors.push({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
      
      if (originalComponentDidCatch) {
        originalComponentDidCatch.call(this, error, errorInfo);
      }
    };
  }
  
  return reactErrors;
}

// Main debug function
async function runDebugAutomation() {
  console.log('🎯 Starting Complete Debug Automation...');
  
  const results = {
    accessibility: await testAccessibility(),
    performance: await testPerformance(),
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
  
  // Start monitoring
  testConsoleErrors();
  testNetworkRequests();
  testReactErrors();
  
  console.log('✅ Debug Automation Setup Complete!');
  console.log('📊 Initial Results:', results);
  
  // Lưu kết quả vào localStorage để MCP có thể đọc
  localStorage.setItem('debugAutomationResults', JSON.stringify(results));
  
  return results;
}

// Auto-run khi script được inject
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runDebugAutomation);
} else {
  runDebugAutomation();
}

// Export cho MCP sử dụng
window.debugAutomation = {
  runDebugAutomation,
  testAccessibility,
  testConsoleErrors,
  testNetworkRequests,
  testPerformance,
  testReactErrors
};

console.log('🎉 Chrome MCP Debug Automation Ready!');
