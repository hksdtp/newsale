# Claude MCP Debug Automation Prompts

## 🔧 Setup Commands

### Inject Debug Script
```
Inject the debug automation script into the current page. Use chrome_inject_script to load the debug panel and monitoring tools.
```

### Take Debug Screenshot
```
Take a screenshot of the current page to capture the visual state for debugging analysis.
```

## 🔍 Accessibility Testing

### Check Form Accessibility
```
Analyze all form elements on the current page and identify accessibility issues:
1. Missing id or name attributes
2. Missing labels or aria-labels
3. Improper form associations
4. Color contrast issues
Report findings with specific element selectors and recommended fixes.
```

### Test Keyboard Navigation
```
Test keyboard navigation on the current page:
1. Check tab order
2. Verify focus indicators
3. Test keyboard shortcuts
4. Identify trapped focus issues
```

## 📊 Performance Analysis

### Analyze Page Performance
```
Analyze the current page performance:
1. Load times and Core Web Vitals
2. Memory usage
3. Network requests timing
4. JavaScript execution time
5. Render blocking resources
Provide optimization recommendations.
```

### Monitor Network Requests
```
Start network monitoring and capture all requests for 30 seconds. Analyze:
1. Failed requests
2. Slow requests (>2s)
3. Large payloads (>1MB)
4. Duplicate requests
5. API response times
```

## 🐛 Error Detection

### Capture Console Errors
```
Monitor console for errors and warnings for 60 seconds. Categorize by:
1. JavaScript errors
2. Network errors
3. React/framework errors
4. Third-party script errors
5. Performance warnings
```

### Test Error Boundaries
```
Test React error boundaries by:
1. Triggering intentional errors
2. Checking error handling
3. Verifying user feedback
4. Testing recovery mechanisms
```

## 🎯 Interaction Testing

### Test Form Interactions
```
Test all form interactions on the current page:
1. Fill out forms with test data
2. Trigger validation
3. Test submit functionality
4. Check error handling
5. Verify success states
```

### Test Navigation
```
Test navigation functionality:
1. Click all navigation links
2. Test back/forward buttons
3. Check URL changes
4. Verify page state persistence
5. Test deep linking
```

## 🔄 Automated Workflows

### Run Complete Debug Audit
```
Run a complete debug audit of the current page:
1. Take initial screenshot
2. Inject debug monitoring
3. Check accessibility issues
4. Analyze performance
5. Monitor for errors
6. Test key interactions
7. Generate comprehensive report
```

### Compare Before/After
```
Compare the current page state with a previous version:
1. Take current screenshot
2. Load previous version (if available)
3. Take comparison screenshot
4. Highlight differences
5. Analyze performance changes
6. Report accessibility improvements
```

## 📋 Reporting

### Generate Debug Report
```
Generate a comprehensive debug report including:
1. Executive summary
2. Accessibility findings
3. Performance metrics
4. Error analysis
5. Interaction test results
6. Recommendations
7. Screenshots and evidence
```

### Export Debug Data
```
Export all collected debug data in JSON format for further analysis or integration with other tools.
```

## 🚀 Quick Commands

### Quick Accessibility Check
```
Quickly check the current page for common accessibility issues and provide a summary with the top 5 issues to fix.
```

### Quick Performance Check
```
Quickly analyze page performance and provide the top 3 performance bottlenecks with specific recommendations.
```

### Quick Error Check
```
Quickly scan for JavaScript errors and console warnings, providing a summary of critical issues.
```

## 💡 Usage Examples

### Example 1: Debug New Feature
```
I just deployed a new task creation form. Please:
1. Take a screenshot of the form
2. Check for accessibility issues
3. Test form validation
4. Monitor network requests during submission
5. Report any issues found
```

### Example 2: Performance Investigation
```
Users are reporting slow page loads. Please:
1. Analyze current page performance
2. Monitor network requests
3. Check for memory leaks
4. Identify render-blocking resources
5. Provide optimization recommendations
```

### Example 3: Cross-browser Testing
```
Test the current page across different scenarios:
1. Test with different viewport sizes
2. Simulate slow network conditions
3. Test keyboard-only navigation
4. Check for browser-specific issues
5. Verify responsive design
```

## 🔧 Advanced Debugging

### Memory Leak Detection
```
Monitor for memory leaks by:
1. Taking initial memory snapshot
2. Performing user interactions
3. Taking follow-up snapshots
4. Analyzing memory growth
5. Identifying leak sources
```

### Security Audit
```
Perform basic security checks:
1. Check for exposed sensitive data
2. Verify HTTPS usage
3. Check for XSS vulnerabilities
4. Analyze third-party scripts
5. Review cookie security
```
