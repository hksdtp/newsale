// Test Chrome MCP Commands
// Script để test các lệnh Chrome MCP automation

const http = require('http');

async function testMCPCommands() {
  console.log('🧪 Testing Chrome MCP Commands...');
  
  const baseUrl = 'http://127.0.0.1:12306';
  
  const commands = [
    {
      name: 'Get Windows and Tabs',
      method: 'get_windows_and_tabs',
      params: {}
    },
    {
      name: 'Take Screenshot',
      method: 'chrome_screenshot',
      params: {
        format: 'png',
        quality: 80
      }
    },
    {
      name: 'Get Current Tab Content',
      method: 'chrome_get_web_content',
      params: {}
    },
    {
      name: 'Inject Debug Script',
      method: 'chrome_inject_script',
      params: {
        script: `
          console.log('🔧 MCP Debug Injection Started');
          
          // Quick accessibility check
          const formElements = document.querySelectorAll('input, select, textarea, button');
          const issues = [];
          
          formElements.forEach((element, index) => {
            const problems = [];
            
            if (!element.id && !element.name) {
              problems.push('Missing id/name');
            }
            
            if ((element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') && !element.labels?.length) {
              const associatedLabel = document.querySelector(\`label[for="\${element.id}"]\`);
              if (!associatedLabel) {
                problems.push('Missing label');
              }
            }
            
            if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
              problems.push('Missing aria-label');
            }
            
            if (problems.length > 0) {
              issues.push({
                element: \`\${element.tagName}\${element.type ? \`[\${element.type}]\` : ''}\`,
                problems: problems,
                selector: element.id ? \`#\${element.id}\` : element.className ? \`.\${element.className.split(' ')[0]}\` : \`\${element.tagName.toLowerCase()}:nth-child(\${index + 1})\`
              });
            }
          });
          
          console.log(\`🔍 Accessibility Issues Found: \${issues.length}\`, issues);
          
          // Performance check
          const perf = performance.timing;
          const loadTime = perf.loadEventEnd - perf.navigationStart;
          const domReady = perf.domContentLoadedEventEnd - perf.navigationStart;
          
          const memory = performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
          } : null;
          
          const perfData = {
            loadTime: loadTime,
            domReady: domReady,
            memory: memory,
            url: window.location.href
          };
          
          console.log('⚡ Performance Data:', perfData);
          
          // Store results
          const debugResults = {
            accessibility: issues,
            performance: perfData,
            timestamp: new Date().toISOString(),
            url: window.location.href
          };
          
          localStorage.setItem('mcpDebugResults', JSON.stringify(debugResults));
          
          console.log('✅ MCP Debug Complete! Results stored in localStorage.');
          
          return debugResults;
        `
      }
    },
    {
      name: 'Get Debug Results',
      method: 'chrome_evaluate_script',
      params: {
        script: `
          const results = localStorage.getItem('mcpDebugResults');
          return results ? JSON.parse(results) : null;
        `
      }
    }
  ];
  
  const results = [];
  
  for (const command of commands) {
    try {
      console.log(`🔄 Testing: ${command.name}`);
      
      const postData = JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: command.method,
        params: command.params
      });
      
      const options = {
        hostname: '127.0.0.1',
        port: 12306,
        path: '/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              data: data
            });
          });
        });
        
        req.on('error', (err) => {
          reject(err);
        });
        
        req.write(postData);
        req.end();
      });
      
      if (response.statusCode === 200) {
        try {
          const jsonResponse = JSON.parse(response.data);
          if (jsonResponse.error) {
            console.log(`❌ ${command.name}: ${jsonResponse.error.message || jsonResponse.error}`);
            results.push({
              command: command.name,
              status: 'error',
              error: jsonResponse.error
            });
          } else {
            console.log(`✅ ${command.name}: Success`);
            results.push({
              command: command.name,
              status: 'success',
              result: jsonResponse.result
            });
          }
        } catch (parseError) {
          console.log(`❌ ${command.name}: Invalid JSON response`);
          results.push({
            command: command.name,
            status: 'error',
            error: 'Invalid JSON response'
          });
        }
      } else {
        console.log(`❌ ${command.name}: HTTP ${response.statusCode}`);
        results.push({
          command: command.name,
          status: 'error',
          error: `HTTP ${response.statusCode}`
        });
      }
    } catch (error) {
      console.log(`❌ ${command.name}: ${error.message}`);
      results.push({
        command: command.name,
        status: 'error',
        error: error.message
      });
    }
    
    // Wait between commands
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Results Summary:');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.command}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${JSON.stringify(result.error)}`);
    }
  });
  
  return results;
}

// Run tests
testMCPCommands().catch(console.error);
