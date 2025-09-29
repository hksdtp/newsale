// Playwright Debug Automation Script
// Tự động debug web application bằng Playwright

const { chromium } = require('playwright');
const fs = require('fs');

async function runPlaywrightDebug() {
  console.log('🚀 Starting Playwright Debug Automation...');

  let browser, page;

  try {
    // Khởi động browser
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({
      headless: false, // Hiển thị browser để xem quá trình
      devtools: true, // Mở DevTools
    });

    const context = await browser.newContext();
    page = await context.newPage();

    // Navigate đến web app
    console.log('📍 Navigating to http://localhost:3002...');
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('✅ Page loaded successfully');

    // Đọc debug script
    const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');

    // Inject debug script vào trang (không auto-run)
    console.log('💉 Injecting debug script...');
    const modifiedDebugScript = debugScript.replace('runCompleteDebug();', '// Auto-run disabled');
    await page.evaluate(modifiedDebugScript);

    console.log('✅ Debug script injected successfully');

    // Thu thập kết quả debug
    console.log('📊 Collecting debug results...');
    const debugResults = await page.evaluate(() => {
      const results = localStorage.getItem('completeDebugResults');
      return results ? JSON.parse(results) : null;
    });

    // Thu thập console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
      });
    });

    // Chạy lại debug để capture console messages
    console.log('🔄 Running debug again to capture console output...');
    await page.evaluate(() => {
      if (window.debugConsole) {
        window.debugConsole.runCompleteDebug();
      }
    });

    await page.waitForTimeout(3000);

    // Thu thập accessibility issues chi tiết (không lưu element references)
    const accessibilityDetails = await page.evaluate(() => {
      if (window.debugConsole) {
        const issues = window.debugConsole.checkAccessibility();
        // Remove circular references
        return issues.map(issue => ({
          element: issue.element,
          problems: issue.problems,
          selector: issue.selector,
          // Remove elementRef to avoid circular reference
        }));
      }
      return [];
    });

    // Thu thập performance metrics
    const performanceDetails = await page.evaluate(() => {
      if (window.debugConsole) {
        return window.debugConsole.checkPerformance();
      }
      return {};
    });

    // Thu thập React status
    const reactStatus = await page.evaluate(() => {
      if (window.debugConsole) {
        return window.debugConsole.checkReactErrors();
      }
      return {};
    });

    // Thu thập TaskService status
    const taskServiceStatus = await page.evaluate(() => {
      if (window.debugConsole) {
        return window.debugConsole.debugTaskService();
      }
      return {};
    });

    // Tạo báo cáo chi tiết
    const report = {
      timestamp: new Date().toISOString(),
      url: await page.url(),
      title: await page.title(),
      debugResults: debugResults,
      accessibilityDetails: accessibilityDetails,
      performanceDetails: performanceDetails,
      reactStatus: reactStatus,
      taskServiceStatus: taskServiceStatus,
      consoleMessages: consoleMessages.slice(-20), // Lấy 20 messages cuối
    };

    // Lưu báo cáo
    fs.writeFileSync('./debug-report.json', JSON.stringify(report, null, 2));
    console.log('💾 Debug report saved to debug-report.json');

    // Hiển thị báo cáo
    displayReport(report);

    // Chụp screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({
      path: './debug-screenshot.png',
      fullPage: true,
    });
    console.log('📸 Screenshot saved to debug-screenshot.png');
  } catch (error) {
    console.error('❌ Error during debug automation:', error);
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
}

function displayReport(report) {
  console.log('\n🎯 ===== BÁO CÁO DEBUG AUTOMATION =====');
  console.log(`📅 Thời gian: ${report.timestamp}`);
  console.log(`🌐 URL: ${report.url}`);
  console.log(`📄 Title: ${report.title}`);

  // Accessibility Issues
  console.log('\n🔍 === ACCESSIBILITY ISSUES ===');
  if (report.accessibilityDetails && report.accessibilityDetails.length > 0) {
    console.log(`❌ Tìm thấy ${report.accessibilityDetails.length} vấn đề accessibility:`);
    report.accessibilityDetails.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.element} (${issue.selector}):`);
      issue.problems.forEach(problem => {
        console.log(`   • ${problem}`);
      });
    });
  } else {
    console.log('✅ Không tìm thấy vấn đề accessibility');
  }

  // Performance Metrics
  console.log('\n⚡ === PERFORMANCE METRICS ===');
  if (report.performanceDetails) {
    const perf = report.performanceDetails;
    console.log(`📊 Load Time: ${perf.loadTime}ms ${perf.loadTime > 3000 ? '❌ SLOW' : '✅ OK'}`);
    console.log(`📊 DOM Ready: ${perf.domReady}ms ${perf.domReady > 2000 ? '❌ SLOW' : '✅ OK'}`);
    if (perf.memory) {
      console.log(
        `💾 Memory Used: ${perf.memory.used}MB / ${perf.memory.total}MB ${perf.memory.used > 50 ? '⚠️ HIGH' : '✅ OK'}`
      );
    }
  }

  // React Status
  console.log('\n⚛️ === REACT STATUS ===');
  if (report.reactStatus) {
    console.log(`React DevTools: ${report.reactStatus.hasReactDevTools ? '✅' : '❌'}`);
    console.log(`React Available: ${report.reactStatus.hasReact ? '✅' : '❌'}`);
    console.log(`Component Count: ${report.reactStatus.componentCount || 0}`);
  }

  // TaskService Status
  console.log('\n📋 === TASKSERVICE STATUS ===');
  if (report.taskServiceStatus) {
    console.log(`TaskService: ${report.taskServiceStatus.hasTaskService ? '✅' : '❌'}`);
    console.log(`Supabase: ${report.taskServiceStatus.hasSupabase ? '✅' : '❌'}`);
    console.log(`Debug Results: ${report.taskServiceStatus.hasDebugResults ? '✅' : '❌'}`);
  }

  // Console Messages
  console.log('\n📝 === CONSOLE MESSAGES (Recent) ===');
  if (report.consoleMessages && report.consoleMessages.length > 0) {
    report.consoleMessages.forEach((msg, index) => {
      const icon = msg.type === 'error' ? '❌' : msg.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} [${msg.type.toUpperCase()}] ${msg.text}`);
    });
  } else {
    console.log('✅ Không có console messages');
  }

  // Recommendations
  console.log('\n💡 === KHUYẾN NGHỊ ===');
  const recommendations = [];

  if (report.accessibilityDetails && report.accessibilityDetails.length > 0) {
    recommendations.push(
      '🔧 Sửa các vấn đề accessibility bằng cách thêm id, name, và aria-labels cho form elements'
    );
  }

  if (report.performanceDetails && report.performanceDetails.loadTime > 3000) {
    recommendations.push('⚡ Tối ưu performance - load time quá chậm');
  }

  if (
    report.performanceDetails &&
    report.performanceDetails.memory &&
    report.performanceDetails.memory.used > 50
  ) {
    recommendations.push('💾 Kiểm tra memory leaks - sử dụng memory cao');
  }

  if (!report.reactStatus?.hasReactDevTools) {
    recommendations.push('⚛️ Cài đặt React DevTools để debug React components');
  }

  if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  } else {
    console.log('✅ Không có khuyến nghị đặc biệt - ứng dụng hoạt động tốt!');
  }

  console.log('\n🎉 === DEBUG AUTOMATION HOÀN THÀNH ===');
  console.log('📄 Chi tiết đầy đủ đã được lưu trong debug-report.json');
  console.log('📸 Screenshot đã được lưu trong debug-screenshot.png');
}

// Chạy debug automation
runPlaywrightDebug().catch(console.error);
