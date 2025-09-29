// Check MCP Connection Script
// Kiểm tra kết nối giữa Chrome Extension và MCP Server

const http = require('http');
const fs = require('fs');

async function checkMCPConnection() {
  console.log('🔍 Checking MCP Chrome Connection...');
  
  // Check if MCP server is running
  try {
    const response = await fetch('http://127.0.0.1:12306/mcp');
    console.log('✅ MCP Server is running on port 12306');
  } catch (error) {
    console.log('❌ MCP Server not accessible:', error.message);
    return false;
  }
  
  // Check Chrome extension files
  const extensionPath = '/Users/ninh/Desktop/chrome-mcp-extension';
  const manifestPath = `${extensionPath}/manifest.json`;
  
  if (fs.existsSync(manifestPath)) {
    console.log('✅ Chrome Extension files exist');
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`✅ Extension version: ${manifest.version}`);
      console.log(`✅ Extension name: ${manifest.name}`);
    } catch (error) {
      console.log('❌ Error reading manifest:', error.message);
    }
  } else {
    console.log('❌ Chrome Extension files not found');
    return false;
  }
  
  // Check if debug scripts exist
  const debugScripts = [
    '/Users/ninh/Webapp/newsale/debug-automation.js',
    '/Users/ninh/Webapp/newsale/mcp-debug-inject.js',
    '/Users/ninh/Webapp/newsale/test-mcp-commands.js'
  ];
  
  debugScripts.forEach(script => {
    if (fs.existsSync(script)) {
      console.log(`✅ Debug script exists: ${script.split('/').pop()}`);
    } else {
      console.log(`❌ Debug script missing: ${script.split('/').pop()}`);
    }
  });
  
  return true;
}

// Test MCP commands
async function testMCPCommands() {
  console.log('\n🧪 Testing MCP Commands...');
  
  const testCommands = [
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
      name: 'Get Web Content',
      method: 'chrome_get_web_content',
      params: {
        url: 'http://localhost:3002'
      }
    }
  ];
  
  for (const command of testCommands) {
    try {
      console.log(`🔄 Testing: ${command.name}`);
      
      const response = await fetch('http://127.0.0.1:12306/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: command.method,
          params: command.params
        })
      });
      
      const result = await response.text();
      
      if (response.ok) {
        console.log(`✅ ${command.name}: Success`);
      } else {
        console.log(`❌ ${command.name}: ${result}`);
      }
    } catch (error) {
      console.log(`❌ ${command.name}: ${error.message}`);
    }
    
    // Wait between commands
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Main function
async function main() {
  console.log('🚀 MCP Chrome Debug Setup Checker\n');
  
  const connectionOK = await checkMCPConnection();
  
  if (connectionOK) {
    console.log('\n📋 Setup Instructions:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked" and select: /Users/ninh/Desktop/chrome-mcp-extension/');
    console.log('4. Click the extension icon and click "Connect"');
    console.log('5. Restart Claude Desktop to recognize MCP server');
    console.log('\n🧪 After setup, you can test with:');
    console.log('- "Take a screenshot of the current page"');
    console.log('- "List all open tabs"');
    console.log('- "Inject debug script into current page"');
    
    // Test commands if connection seems ready
    await testMCPCommands();
  } else {
    console.log('\n❌ Setup incomplete. Please check the issues above.');
  }
  
  console.log('\n✅ MCP Chrome Debug Setup Check Complete!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkMCPConnection,
  testMCPCommands
};
