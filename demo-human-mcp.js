#!/usr/bin/env node

/**
 * Demo Human-MCP Integration
 * Tạo screenshot demo và test visual analysis
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Human-MCP Demo\n');

// Tạo HTML demo page để chụp screenshot
const demoHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo UI for Human-MCP Analysis</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1.2em;
        }
        
        .form-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #333;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        /* Intentional UI issues for Human-MCP to detect */
        .issue-1 {
            /* Low contrast text */
            color: #ccc;
            background: #ddd;
            padding: 10px;
            margin: 10px 0;
        }
        
        .issue-2 {
            /* Missing alt text on images */
            width: 100px;
            height: 100px;
            background: #ff6b6b;
            margin: 10px;
        }
        
        .issue-3 {
            /* Overlapping elements */
            position: relative;
            z-index: -1;
            margin-top: -20px;
            background: yellow;
            padding: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 NewsAle Dashboard</h1>
            <p>Demo interface for Human-MCP visual analysis</p>
        </div>
        
        <div class="form-section">
            <h2>📝 Tạo công việc mới</h2>
            
            <div class="form-group">
                <label for="taskName">Tên công việc:</label>
                <input type="text" id="taskName" placeholder="Nhập tên công việc...">
            </div>
            
            <div class="form-group">
                <label for="taskDescription">Mô tả:</label>
                <textarea id="taskDescription" rows="4" placeholder="Mô tả chi tiết công việc..."></textarea>
            </div>
            
            <div class="form-group">
                <label for="taskPriority">Độ ưu tiên:</label>
                <select id="taskPriority">
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="assignee">Người thực hiện:</label>
                <input type="text" id="assignee" placeholder="Chọn người thực hiện...">
            </div>
        </div>
        
        <!-- Intentional accessibility issues -->
        <div class="issue-1">
            Đây là text có contrast thấp - khó đọc!
        </div>
        
        <div class="issue-2" title="Missing alt text"></div>
        
        <div class="issue-3">
            Element này bị overlap với element khác
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">24</div>
                <div class="stat-label">Công việc hoàn thành</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number">8</div>
                <div class="stat-label">Đang thực hiện</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number">3</div>
                <div class="stat-label">Quá hạn</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number">95%</div>
                <div class="stat-label">Hiệu suất</div>
            </div>
        </div>
        
        <div class="button-group">
            <button class="btn btn-primary">💾 Lưu công việc</button>
            <button class="btn btn-secondary">❌ Hủy bỏ</button>
        </div>
    </div>
</body>
</html>
`;

// Tạo file demo
fs.writeFileSync('demo-ui.html', demoHTML);

console.log('✅ Đã tạo demo-ui.html');
console.log('📋 File này chứa:');
console.log('   • UI form tạo công việc');
console.log('   • Stats dashboard');
console.log('   • Intentional accessibility issues để test Human-MCP');
console.log('');
console.log('🎯 Cách sử dụng:');
console.log('1. Mở demo-ui.html trong browser');
console.log('2. Chụp screenshot');
console.log('3. Sử dụng Human-MCP để phân tích:');
console.log('');
console.log('   eyes_analyze {');
console.log('     "source": "screenshot.png",');
console.log('     "type": "image",');
console.log('     "analysis_type": "accessibility"');
console.log('   }');
console.log('');
console.log('🔍 Human-MCP sẽ phát hiện:');
console.log('   • Low contrast text issues');
console.log('   • Missing alt text');
console.log('   • Overlapping elements');
console.log('   • Layout problems');
console.log('');
console.log('🚀 Sau đó dùng Serena MCP để sửa code!');

// Tạo example MCP workflow
const workflowExample = `
# Example Human-MCP + Serena MCP Workflow

## 1. Visual Analysis với Human-MCP
\`\`\`json
{
  "tool": "eyes_analyze",
  "input": {
    "source": "demo-ui-screenshot.png",
    "type": "image", 
    "analysis_type": "accessibility",
    "check_accessibility": true
  }
}
\`\`\`

## 2. Find Code với Serena MCP
\`\`\`json
{
  "tool": "search_for_pattern",
  "input": {
    "substring_pattern": "issue-1|issue-2|issue-3",
    "paths_include_glob": "*.html,*.css,*.tsx"
  }
}
\`\`\`

## 3. Fix Issues với Serena MCP
\`\`\`json
{
  "tool": "replace_regex",
  "input": {
    "relative_path": "demo-ui.html",
    "regex": "color: #ccc;\\s*background: #ddd;",
    "repl": "color: #333; background: #f8f9fa;",
    "allow_multiple_occurrences": true
  }
}
\`\`\`

## 4. Verify với Human-MCP
\`\`\`json
{
  "tool": "eyes_compare", 
  "input": {
    "source1": "before-fix.png",
    "source2": "after-fix.png",
    "comparison_type": "accessibility"
  }
}
\`\`\`
`;

fs.writeFileSync('mcp-workflow-example.md', workflowExample);
console.log('✅ Đã tạo mcp-workflow-example.md');
console.log('📖 File này chứa example workflow sử dụng cả 2 MCP servers');
