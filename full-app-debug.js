// Full Application Debug Script
// Debug toàn bộ ứng dụng qua các trang chính

const { chromium } = require('playwright');
const fs = require('fs');

async function runFullAppDebug() {
  console.log('🚀 Starting Full Application Debug...');
  
  let browser, page;
  
  try {
    // Khởi động browser
    browser = await chromium.launch({ 
      headless: false,
      devtools: true
    });
    
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Đọc debug script
    const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');
    const modifiedDebugScript = debugScript.replace('runCompleteDebug();', '// Auto-run disabled');
    
    const reports = [];
    
    // 1. Debug trang Region Selection
    console.log('\n📍 === DEBUGGING REGION SELECTION PAGE ===');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.evaluate(modifiedDebugScript);
    
    const regionReport = await collectDebugData(page, 'Region Selection');
    reports.push(regionReport);
    console.log('✅ Region Selection debug completed');
    
    // 2. Chọn khu vực Hà Nội
    console.log('\n📍 === NAVIGATING TO HN REGION ===');
    await page.click('button:has-text("Hà Nội")');
    await page.waitForTimeout(2000);
    
    // 3. Debug trang Password
    console.log('\n📍 === DEBUGGING PASSWORD PAGE ===');
    await page.evaluate(modifiedDebugScript);
    
    const passwordReport = await collectDebugData(page, 'Password Page');
    reports.push(passwordReport);
    console.log('✅ Password page debug completed');
    
    // 4. Login với password
    console.log('\n📍 === LOGGING IN ===');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Tiếp tục")');
    await page.waitForTimeout(3000);
    
    // 5. Debug Dashboard chính
    console.log('\n📍 === DEBUGGING MAIN DASHBOARD ===');
    await page.evaluate(modifiedDebugScript);
    
    const dashboardReport = await collectDebugData(page, 'Main Dashboard');
    reports.push(dashboardReport);
    console.log('✅ Main dashboard debug completed');
    
    // 6. Test tạo task mới
    console.log('\n📍 === TESTING CREATE TASK MODAL ===');
    try {
      await page.click('button:has-text("Tạo công việc mới")');
      await page.waitForTimeout(2000);
      
      await page.evaluate(modifiedDebugScript);
      const createTaskReport = await collectDebugData(page, 'Create Task Modal');
      reports.push(createTaskReport);
      console.log('✅ Create task modal debug completed');
      
      // Đóng modal
      await page.press('body', 'Escape');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('⚠️ Could not test create task modal:', error.message);
    }
    
    // 7. Tạo báo cáo tổng hợp
    const fullReport = {
      timestamp: new Date().toISOString(),
      summary: generateSummary(reports),
      pageReports: reports
    };
    
    // Lưu báo cáo
    fs.writeFileSync('./full-debug-report.json', JSON.stringify(fullReport, null, 2));
    console.log('\n💾 Full debug report saved to full-debug-report.json');
    
    // Hiển thị tổng kết
    displayFullReport(fullReport);
    
    // Chụp screenshot cuối
    await page.screenshot({ 
      path: './final-dashboard-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Final screenshot saved');
    
  } catch (error) {
    console.error('❌ Error during full app debug:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function collectDebugData(page, pageName) {
  // Chạy debug functions riêng lẻ để tránh circular reference
  const accessibility = await page.evaluate(() => {
    if (window.debugConsole) {
      const issues = window.debugConsole.checkAccessibility();
      return issues.map(issue => ({
        element: issue.element,
        problems: issue.problems,
        selector: issue.selector
      }));
    }
    return [];
  });
  
  const performance = await page.evaluate(() => {
    if (window.debugConsole) {
      return window.debugConsole.checkPerformance();
    }
    return {};
  });
  
  const react = await page.evaluate(() => {
    if (window.debugConsole) {
      return window.debugConsole.checkReactErrors();
    }
    return {};
  });
  
  const taskService = await page.evaluate(() => {
    if (window.debugConsole) {
      return window.debugConsole.debugTaskService();
    }
    return {};
  });
  
  return {
    pageName: pageName,
    url: await page.url(),
    timestamp: new Date().toISOString(),
    accessibility: accessibility,
    performance: performance,
    react: react,
    taskService: taskService
  };
}

function generateSummary(reports) {
  const totalAccessibilityIssues = reports.reduce((sum, report) => 
    sum + (report.accessibility?.length || 0), 0);
  
  const avgLoadTime = reports.reduce((sum, report) => 
    sum + (report.performance?.loadTime || 0), 0) / reports.length;
  
  const pagesWithReact = reports.filter(report => 
    report.react?.hasReact || report.taskService?.hasTaskService).length;
  
  return {
    totalPages: reports.length,
    totalAccessibilityIssues: totalAccessibilityIssues,
    averageLoadTime: Math.round(avgLoadTime),
    pagesWithReact: pagesWithReact,
    overallStatus: totalAccessibilityIssues > 5 ? 'NEEDS_ATTENTION' : 'GOOD'
  };
}

function displayFullReport(fullReport) {
  console.log('\n🎯 ===== BÁO CÁO DEBUG TOÀN BỘ ỨNG DỤNG =====');
  console.log(`📅 Thời gian: ${fullReport.timestamp}`);
  console.log(`📊 Tổng số trang: ${fullReport.summary.totalPages}`);
  console.log(`❌ Tổng lỗi accessibility: ${fullReport.summary.totalAccessibilityIssues}`);
  console.log(`⚡ Load time trung bình: ${fullReport.summary.averageLoadTime}ms`);
  console.log(`⚛️ Trang có React: ${fullReport.summary.pagesWithReact}/${fullReport.summary.totalPages}`);
  console.log(`📈 Trạng thái tổng thể: ${fullReport.summary.overallStatus}`);
  
  console.log('\n📋 === CHI TIẾT TỪNG TRANG ===');
  fullReport.pageReports.forEach((report, index) => {
    console.log(`\n${index + 1}. ${report.pageName}`);
    console.log(`   URL: ${report.url}`);
    console.log(`   Accessibility Issues: ${report.accessibility?.length || 0}`);
    console.log(`   Load Time: ${report.performance?.loadTime || 'N/A'}ms`);
    console.log(`   Memory: ${report.performance?.memory?.used || 'N/A'}MB`);
    console.log(`   React: ${report.react?.hasReact ? '✅' : '❌'}`);
    console.log(`   TaskService: ${report.taskService?.hasTaskService ? '✅' : '❌'}`);
    
    if (report.accessibility && report.accessibility.length > 0) {
      console.log('   🔍 Accessibility Issues:');
      report.accessibility.forEach((issue, i) => {
        console.log(`      ${i + 1}. ${issue.element}: ${issue.problems.join(', ')}`);
      });
    }
  });
  
  console.log('\n💡 === KHUYẾN NGHỊ TỔNG THỂ ===');
  if (fullReport.summary.totalAccessibilityIssues > 0) {
    console.log('1. 🔧 Sửa các vấn đề accessibility bằng cách thêm id, name, aria-labels');
  }
  if (fullReport.summary.averageLoadTime > 2000) {
    console.log('2. ⚡ Tối ưu performance - load time chậm');
  }
  if (fullReport.summary.pagesWithReact < fullReport.summary.totalPages) {
    console.log('3. ⚛️ Kiểm tra React loading trên một số trang');
  }
  
  console.log('\n🎉 === DEBUG TOÀN BỘ ỨNG DỤNG HOÀN THÀNH ===');
}

// Chạy debug toàn bộ ứng dụng
runFullAppDebug().catch(console.error);
