// Automated Debug Runner
// Script tự động để inject debug và thu thập kết quả

const fs = require('fs');
const http = require('http');

// Đọc debug script
const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');

async function runAutomatedDebug() {
  console.log('🚀 Starting Automated Debug Runner...');
  
  // Tạo script injection payload
  const injectionScript = `
    ${debugScript}
    
    // Wait for debug to complete and return results
    setTimeout(() => {
      const results = localStorage.getItem('completeDebugResults');
      if (results) {
        console.log('📊 AUTOMATED_DEBUG_RESULTS:', JSON.stringify(JSON.parse(results), null, 2));
      }
    }, 5000);
  `;
  
  // Test MCP connection first
  try {
    const testResponse = await makeRequest('GET', '/mcp');
    console.log('🔍 MCP Server status:', testResponse.statusCode);
  } catch (error) {
    console.log('❌ MCP Server not accessible:', error.message);
    console.log('📋 Manual Instructions:');
    console.log('1. Open http://localhost:3002 in Chrome');
    console.log('2. Press F12 to open DevTools');
    console.log('3. Go to Console tab');
    console.log('4. Copy and paste the debug script');
    console.log('5. Results will be displayed automatically');
    return;
  }
  
  // Try to inject script via MCP
  const commands = [
    {
      name: 'Navigate to App',
      method: 'chrome_navigate',
      params: { url: 'http://localhost:3002' }
    },
    {
      name: 'Wait for Load',
      method: 'chrome_wait',
      params: { timeout: 3000 }
    },
    {
      name: 'Inject Debug Script',
      method: 'chrome_evaluate_script',
      params: { script: injectionScript }
    },
    {
      name: 'Get Debug Results',
      method: 'chrome_evaluate_script',
      params: { 
        script: `
          const results = localStorage.getItem('completeDebugResults');
          return results ? JSON.parse(results) : null;
        `
      }
    }
  ];
  
  console.log('🔄 Executing debug automation...');
  
  for (const command of commands) {
    try {
      console.log(`📝 ${command.name}...`);
      
      const response = await makeRequest('POST', '/mcp', {
        jsonrpc: '2.0',
        id: Date.now(),
        method: command.method,
        params: command.params
      });
      
      if (response.statusCode === 200) {
        const result = JSON.parse(response.data);
        if (result.error) {
          console.log(`❌ ${command.name}: ${result.error.message || result.error}`);
        } else {
          console.log(`✅ ${command.name}: Success`);
          if (command.name === 'Get Debug Results' && result.result) {
            console.log('📊 Debug Results Retrieved:', JSON.stringify(result.result, null, 2));
          }
        }
      } else {
        console.log(`❌ ${command.name}: HTTP ${response.statusCode}`);
      }
      
      // Wait between commands
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ ${command.name}: ${error.message}`);
    }
  }
  
  console.log('✅ Automated debug completed!');
}

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 12306,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: responseData
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Manual fallback function
function showManualInstructions() {
  console.log('\n📋 Manual Debug Instructions:');
  console.log('=====================================');
  console.log('1. Open Chrome and navigate to: http://localhost:3002');
  console.log('2. Press F12 to open Developer Tools');
  console.log('3. Click on the "Console" tab');
  console.log('4. Copy the entire content of manual-debug-console.js');
  console.log('5. Paste it into the console and press Enter');
  console.log('6. The debug will run automatically and show results');
  console.log('');
  console.log('🔍 What the debug will check:');
  console.log('   • Accessibility issues (missing ids, labels, aria-labels)');
  console.log('   • Performance metrics (load time, memory usage)');
  console.log('   • Console errors and warnings');
  console.log('   • Network requests monitoring');
  console.log('   • React component status');
  console.log('   • TaskService debugging');
  console.log('');
  console.log('📊 Results will be displayed in console and stored in localStorage');
}

// Run the automation
runAutomatedDebug().then(() => {
  console.log('\n💡 If automation failed, use manual method:');
  showManualInstructions();
}).catch(error => {
  console.error('❌ Automation failed:', error);
  showManualInstructions();
});
