#!/usr/bin/env node

/**
 * Test MCP Integration
 * Kiểm tra cả Serena MCP và Human-MCP hoạt động đúng
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing MCP Integration...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Check Human-MCP installation
async function testHumanMCP() {
  log('blue', '1. Testing Human-MCP...');
  
  return new Promise((resolve) => {
    const child = spawn('npx', ['@goonnguyen/human-mcp', '--version'], {
      stdio: 'pipe'
    });
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0 || output.includes('human-mcp')) {
        log('green', '   ✅ Human-MCP is available');
        resolve(true);
      } else {
        log('red', '   ❌ Human-MCP not found');
        log('yellow', '   💡 Run: npm install -g @goonnguyen/human-mcp');
        resolve(false);
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      child.kill();
      log('red', '   ❌ Human-MCP test timeout');
      resolve(false);
    }, 10000);
  });
}

// Test 2: Check Serena MCP (uvx)
async function testSerenaMCP() {
  log('blue', '2. Testing Serena MCP...');
  
  return new Promise((resolve) => {
    const child = spawn('uvx', ['--version'], {
      stdio: 'pipe'
    });
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log('green', '   ✅ uvx is available (Serena MCP can run)');
        resolve(true);
      } else {
        log('red', '   ❌ uvx not found');
        log('yellow', '   💡 Run: pip install uvx');
        resolve(false);
      }
    });
    
    child.on('error', () => {
      log('red', '   ❌ uvx not found');
      log('yellow', '   💡 Run: pip install uvx');
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      child.kill();
      log('red', '   ❌ uvx test timeout');
      resolve(false);
    }, 5000);
  });
}

// Test 3: Check configuration files
function testConfigFiles() {
  log('blue', '3. Testing configuration files...');
  
  const files = [
    'mcp-config.json',
    '.env.docker',
    'docker-compose.yml',
    'MCP_INTEGRATION.md'
  ];
  
  let allExist = true;
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      log('green', `   ✅ ${file} exists`);
    } else {
      log('red', `   ❌ ${file} missing`);
      allExist = false;
    }
  });
  
  return allExist;
}

// Test 4: Check Docker containers
async function testDockerContainers() {
  log('blue', '4. Testing Docker containers...');
  
  return new Promise((resolve) => {
    const child = spawn('docker-compose', ['ps', '--format', 'json'], {
      stdio: 'pipe'
    });
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        try {
          const containers = output.trim().split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
          
          const runningContainers = containers.filter(c => c.State === 'running');
          
          if (runningContainers.length > 0) {
            log('green', `   ✅ ${runningContainers.length} containers running`);
            runningContainers.forEach(c => {
              log('green', `      • ${c.Service}: ${c.State}`);
            });
            resolve(true);
          } else {
            log('red', '   ❌ No containers running');
            resolve(false);
          }
        } catch (e) {
          log('red', '   ❌ Error parsing container status');
          resolve(false);
        }
      } else {
        log('red', '   ❌ Docker Compose not available');
        resolve(false);
      }
    });
    
    child.on('error', () => {
      log('red', '   ❌ Docker Compose not found');
      resolve(false);
    });
  });
}

// Test 5: Check webapp accessibility
async function testWebappAccess() {
  log('blue', '5. Testing webapp accessibility...');
  
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      log('green', '   ✅ Webapp accessible at http://localhost:3000');
      return true;
    } else {
      log('red', `   ❌ Webapp returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log('red', '   ❌ Webapp not accessible');
    log('yellow', '   💡 Check if Docker containers are running');
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 MCP Integration Test Suite\n');
  
  const results = {
    humanMCP: await testHumanMCP(),
    serenaMCP: await testSerenaMCP(),
    configFiles: testConfigFiles(),
    dockerContainers: await testDockerContainers(),
    webappAccess: await testWebappAccess()
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(color, `${status} ${test}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    log('green', '\n🎉 All tests passed! MCP integration is ready!');
    console.log('\n📋 Next steps:');
    console.log('• Configure your MCP client (Claude Desktop, Cursor, etc.)');
    console.log('• Set GOOGLE_GEMINI_API_KEY environment variable');
    console.log('• Start using visual analysis with Human-MCP');
    console.log('• Use Serena MCP for code manipulation');
  } else {
    log('red', '\n⚠️  Some tests failed. Please fix the issues above.');
  }
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runTests };
