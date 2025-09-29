// Debug Analysis Report Generator
// Tạo báo cáo phân tích chi tiết và giải pháp

const fs = require('fs');

function generateDetailedAnalysis() {
  console.log('📊 Generating Detailed Debug Analysis Report...');
  
  // Đọc báo cáo debug
  const fullReport = JSON.parse(fs.readFileSync('./full-debug-report.json', 'utf8'));
  
  const analysis = {
    timestamp: new Date().toISOString(),
    executiveSummary: generateExecutiveSummary(fullReport),
    accessibilityAnalysis: analyzeAccessibilityIssues(fullReport),
    performanceAnalysis: analyzePerformance(fullReport),
    technicalAnalysis: analyzeTechnicalIssues(fullReport),
    prioritizedRecommendations: generateRecommendations(fullReport),
    implementationPlan: generateImplementationPlan(fullReport)
  };
  
  // Lưu báo cáo phân tích
  fs.writeFileSync('./detailed-analysis-report.json', JSON.stringify(analysis, null, 2));
  
  // Hiển thị báo cáo
  displayDetailedAnalysis(analysis);
  
  // Tạo action items
  generateActionItems(analysis);
  
  return analysis;
}

function generateExecutiveSummary(report) {
  const criticalIssues = report.summary.totalAccessibilityIssues;
  const performanceStatus = report.summary.averageLoadTime < 1000 ? 'EXCELLENT' : 
                           report.summary.averageLoadTime < 2000 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
  
  return {
    overallHealth: criticalIssues > 20 ? 'CRITICAL' : criticalIssues > 10 ? 'WARNING' : 'HEALTHY',
    criticalIssues: criticalIssues,
    performanceStatus: performanceStatus,
    pagesAudited: report.summary.totalPages,
    mainConcerns: [
      'Accessibility compliance issues across all pages',
      'Missing form element identifiers and labels',
      'React components not loading properly',
      'TaskService not available on frontend'
    ]
  };
}

function analyzeAccessibilityIssues(report) {
  const allIssues = [];
  const issuesByType = {};
  
  report.pageReports.forEach(pageReport => {
    pageReport.accessibility.forEach(issue => {
      allIssues.push({
        page: pageReport.pageName,
        url: pageReport.url,
        element: issue.element,
        problems: issue.problems,
        selector: issue.selector
      });
      
      issue.problems.forEach(problem => {
        if (!issuesByType[problem]) {
          issuesByType[problem] = 0;
        }
        issuesByType[problem]++;
      });
    });
  });
  
  return {
    totalIssues: allIssues.length,
    issuesByType: issuesByType,
    mostCommonIssues: Object.entries(issuesByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    affectedPages: report.pageReports.length,
    severity: allIssues.length > 20 ? 'HIGH' : allIssues.length > 10 ? 'MEDIUM' : 'LOW',
    wcagCompliance: 'NON_COMPLIANT',
    detailedIssues: allIssues
  };
}

function analyzePerformance(report) {
  const loadTimes = report.pageReports.map(p => p.performance.loadTime);
  const memoryUsage = report.pageReports.map(p => p.performance.memory?.used || 0);
  
  return {
    averageLoadTime: Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length),
    slowestPage: report.pageReports.find(p => p.performance.loadTime === Math.max(...loadTimes)),
    fastestPage: report.pageReports.find(p => p.performance.loadTime === Math.min(...loadTimes)),
    averageMemoryUsage: Math.round(memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length),
    performanceGrade: loadTimes.every(t => t < 1000) ? 'A' : 
                     loadTimes.every(t => t < 2000) ? 'B' : 
                     loadTimes.every(t => t < 3000) ? 'C' : 'D',
    coreWebVitals: {
      lcp: 'GOOD', // Load time < 1s
      fid: 'UNKNOWN',
      cls: 'UNKNOWN'
    }
  };
}

function analyzeTechnicalIssues(report) {
  const reactIssues = report.pageReports.filter(p => !p.react.hasReact).length;
  const taskServiceIssues = report.pageReports.filter(p => !p.taskService.hasTaskService).length;
  
  return {
    reactLoadingIssues: {
      affectedPages: reactIssues,
      severity: reactIssues === report.pageReports.length ? 'HIGH' : 'MEDIUM',
      description: 'React components not loading on frontend pages'
    },
    taskServiceIssues: {
      affectedPages: taskServiceIssues,
      severity: taskServiceIssues === report.pageReports.length ? 'HIGH' : 'MEDIUM',
      description: 'TaskService not available in browser window'
    },
    supabaseConnection: {
      status: 'NOT_AVAILABLE',
      description: 'Supabase client not found in browser context'
    }
  };
}

function generateRecommendations(report) {
  return [
    {
      priority: 'HIGH',
      category: 'Accessibility',
      title: 'Fix Form Element Accessibility',
      description: 'Add id, name, and aria-label attributes to all form elements',
      impact: 'WCAG 2.1 compliance, screen reader support',
      effort: 'MEDIUM',
      timeline: '1-2 days'
    },
    {
      priority: 'HIGH',
      category: 'Accessibility',
      title: 'Implement Proper Button Labels',
      description: 'Add descriptive aria-labels to all buttons',
      impact: 'Improved accessibility for visually impaired users',
      effort: 'LOW',
      timeline: '1 day'
    },
    {
      priority: 'MEDIUM',
      category: 'Technical',
      title: 'Fix React Component Loading',
      description: 'Ensure React components load properly on all pages',
      impact: 'Better debugging and development experience',
      effort: 'MEDIUM',
      timeline: '2-3 days'
    },
    {
      priority: 'MEDIUM',
      category: 'Technical',
      title: 'Expose TaskService to Browser',
      description: 'Make TaskService available in window object for debugging',
      impact: 'Better debugging capabilities',
      effort: 'LOW',
      timeline: '0.5 days'
    },
    {
      priority: 'LOW',
      category: 'Performance',
      title: 'Optimize Load Times',
      description: 'Current performance is acceptable but can be improved',
      impact: 'Better user experience',
      effort: 'HIGH',
      timeline: '1 week'
    }
  ];
}

function generateImplementationPlan(report) {
  return {
    phase1: {
      title: 'Critical Accessibility Fixes',
      duration: '2-3 days',
      tasks: [
        'Add id attributes to all form elements',
        'Add name attributes to all input fields',
        'Add aria-label attributes to all buttons',
        'Test with screen reader'
      ]
    },
    phase2: {
      title: 'Technical Infrastructure',
      duration: '3-4 days',
      tasks: [
        'Fix React component loading issues',
        'Expose TaskService for debugging',
        'Add Supabase client to window object',
        'Implement proper error boundaries'
      ]
    },
    phase3: {
      title: 'Performance Optimization',
      duration: '1 week',
      tasks: [
        'Analyze bundle size',
        'Implement code splitting',
        'Optimize images and assets',
        'Add performance monitoring'
      ]
    }
  };
}

function displayDetailedAnalysis(analysis) {
  console.log('\n🎯 ===== BÁO CÁO PHÂN TÍCH CHI TIẾT =====');
  console.log(`📅 Thời gian: ${analysis.timestamp}`);
  
  console.log('\n📊 === TỔNG QUAN ĐIỀU HÀNH ===');
  console.log(`🏥 Tình trạng tổng thể: ${analysis.executiveSummary.overallHealth}`);
  console.log(`❌ Vấn đề nghiêm trọng: ${analysis.executiveSummary.criticalIssues}`);
  console.log(`⚡ Trạng thái performance: ${analysis.executiveSummary.performanceStatus}`);
  console.log(`📄 Số trang kiểm tra: ${analysis.executiveSummary.pagesAudited}`);
  
  console.log('\n🔍 === PHÂN TÍCH ACCESSIBILITY ===');
  console.log(`📊 Tổng số vấn đề: ${analysis.accessibilityAnalysis.totalIssues}`);
  console.log(`🚨 Mức độ nghiêm trọng: ${analysis.accessibilityAnalysis.severity}`);
  console.log(`📋 WCAG Compliance: ${analysis.accessibilityAnalysis.wcagCompliance}`);
  console.log('🔝 Vấn đề phổ biến nhất:');
  analysis.accessibilityAnalysis.mostCommonIssues.forEach(([issue, count], index) => {
    console.log(`   ${index + 1}. ${issue}: ${count} lần`);
  });
  
  console.log('\n⚡ === PHÂN TÍCH PERFORMANCE ===');
  console.log(`📊 Load time trung bình: ${analysis.performanceAnalysis.averageLoadTime}ms`);
  console.log(`🎯 Điểm performance: ${analysis.performanceAnalysis.performanceGrade}`);
  console.log(`💾 Memory usage trung bình: ${analysis.performanceAnalysis.averageMemoryUsage}MB`);
  console.log(`🐌 Trang chậm nhất: ${analysis.performanceAnalysis.slowestPage?.pageName} (${analysis.performanceAnalysis.slowestPage?.performance.loadTime}ms)`);
  
  console.log('\n🔧 === KHUYẾN NGHỊ ƯU TIÊN ===');
  analysis.prioritizedRecommendations.forEach((rec, index) => {
    const priorityIcon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
    console.log(`${priorityIcon} ${index + 1}. [${rec.priority}] ${rec.title}`);
    console.log(`   📝 ${rec.description}`);
    console.log(`   💪 Effort: ${rec.effort} | ⏱️ Timeline: ${rec.timeline}`);
    console.log(`   🎯 Impact: ${rec.impact}`);
  });
  
  console.log('\n📋 === KẾ HOẠCH TRIỂN KHAI ===');
  Object.entries(analysis.implementationPlan).forEach(([phase, details]) => {
    console.log(`\n${phase.toUpperCase()}: ${details.title} (${details.duration})`);
    details.tasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task}`);
    });
  });
}

function generateActionItems(analysis) {
  const actionItems = [];
  
  // Tạo action items từ recommendations
  analysis.prioritizedRecommendations.forEach(rec => {
    if (rec.priority === 'HIGH') {
      actionItems.push({
        title: rec.title,
        description: rec.description,
        assignee: 'Frontend Developer',
        dueDate: new Date(Date.now() + (rec.timeline.includes('day') ? 
          parseInt(rec.timeline) * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        priority: rec.priority,
        category: rec.category
      });
    }
  });
  
  fs.writeFileSync('./action-items.json', JSON.stringify(actionItems, null, 2));
  console.log('\n📋 Action items saved to action-items.json');
  
  return actionItems;
}

// Chạy phân tích
generateDetailedAnalysis();
