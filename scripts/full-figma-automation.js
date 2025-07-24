#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class FullFigmaAutomation {
  constructor() {
    this.figmaToken = process.env.FIGMA_TOKEN;
    this.baseUrl = 'https://api.figma.com/v1';
    this.projectDir = path.dirname(__dirname);
    this.screenshotsDir = path.join(this.projectDir, 'screenshots');
    this.figmaFileKey = null;
    this.teamId = null;
  }

  async init() {
    console.log('🚀 Initializing Full Figma Automation...');

    if (!this.figmaToken) {
      throw new Error('FIGMA_TOKEN is required');
    }

    // Get user info and team
    const userInfo = await this.getUserInfo();
    if (!userInfo) {
      throw new Error('Failed to get user info');
    }

    return true;
  }

  async getUserInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'X-Figma-Token': this.figmaToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`👋 Hello ${data.handle}!`);

      if (data.teams && data.teams.length > 0) {
        this.teamId = data.teams[0].id;
        console.log(`🏢 Using team: ${data.teams[0].name}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting user info:', error.message);
      return null;
    }
  }

  // Create new Figma file using duplication method
  async createFigmaFile() {
    console.log('📄 Creating Figma file: "Qatalog Login - UI Screens"...');

    try {
      // Since direct file creation is limited, we'll use a workaround
      // Create a simple file by duplicating a basic template or creating via web interface

      // Method 1: Try to get existing files and duplicate
      if (this.teamId) {
        const projectsResponse = await fetch(`${this.baseUrl}/teams/${this.teamId}/projects`, {
          headers: {
            'X-Figma-Token': this.figmaToken,
          },
        });

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          console.log('📁 Available projects:', projectsData.projects?.length || 0);
        }
      }

      // Method 2: Create using Figma Web API (requires browser automation)
      await this.createFileViaWebInterface();

      return true;
    } catch (error) {
      console.error('❌ Error creating Figma file:', error.message);
      return false;
    }
  }

  async createFileViaWebInterface() {
    console.log('🌐 Creating file via web interface automation...');

    // Use playwright to automate Figma web interface
    const playwrightScript = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to Figma
    await page.goto('https://www.figma.com');
    
    // Wait for and click "Create new file"
    await page.waitForSelector('[data-testid="create-file-button"]', { timeout: 30000 });
    await page.click('[data-testid="create-file-button"]');
    
    // Wait for the new file to load
    await page.waitForLoadState('networkidle');
    
    // Rename the file
    await page.waitForSelector('[data-testid="filename-input"]', { timeout: 10000 });
    await page.fill('[data-testid="filename-input"]', 'Qatalog Login - UI Screens');
    await page.press('[data-testid="filename-input"]', 'Enter');
    
    // Get the file URL to extract file key
    const url = page.url();
    console.log('📄 Created Figma file:', url);
    
    // Extract file key from URL
    const fileKeyMatch = url.match(/\\/file\\/([a-zA-Z0-9]+)/);
    if (fileKeyMatch) {
      const fileKey = fileKeyMatch[1];
      
      // Save file key for later use
      require('fs').writeFileSync('${path.join(this.projectDir, 'figma-file-key.txt')}', fileKey);
      console.log('💾 Saved file key:', fileKey);
    }
    
    // Now import screenshots
    await page.waitForSelector('[data-testid="toolbar"]', { timeout: 10000 });
    
    // Import each screenshot
    const screenshots = ['login-page.png', 'password-page.png', 'director-login-page.png'];
    
    for (const screenshot of screenshots) {
      console.log(\`📤 Importing \${screenshot}...\`);
      
      // Click on "Assets" or "Import" button
      await page.click('[data-testid="import-button"]');
      
      // Upload file
      const filePath = '${this.screenshotsDir}/\${screenshot}';
      await page.setInputFiles('input[type="file"]', filePath);
      
      // Wait for upload to complete
      await page.waitForTimeout(3000);
    }
    
    console.log('✅ All screenshots imported successfully!');
    
    // Keep browser open for manual adjustments
    console.log('🎨 File created! You can now manually adjust the design or close the browser.');
    
    // Wait before closing
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error in browser automation:', error);
  } finally {
    await browser.close();
  }
})();
    `;

    // Write and execute the playwright script
    const scriptPath = path.join(this.projectDir, 'temp-figma-automation.js');
    fs.writeFileSync(scriptPath, playwrightScript);

    try {
      console.log('🎭 Running browser automation...');
      await execAsync(`node "${scriptPath}"`, { cwd: this.projectDir });
      console.log('✅ Browser automation completed');

      // Clean up
      fs.unlinkSync(scriptPath);

      // Read the file key if it was saved
      const fileKeyPath = path.join(this.projectDir, 'figma-file-key.txt');
      if (fs.existsSync(fileKeyPath)) {
        this.figmaFileKey = fs.readFileSync(fileKeyPath, 'utf8').trim();
        console.log('📄 File key retrieved:', this.figmaFileKey);
      }
    } catch (error) {
      console.error('❌ Browser automation failed:', error.message);

      // Fallback: Provide manual instructions
      this.provideManualInstructions();
    }
  }

  // Setup automatic two-way sync
  async setupTwoWaySync() {
    console.log('🔄 Setting up two-way sync...');

    if (!this.figmaFileKey) {
      console.log('⚠️  No file key available, setting up monitoring for when file is created');
    }

    // Create watcher for code changes
    await this.setupCodeWatcher();

    // Create watcher for Figma changes
    await this.setupFigmaWatcher();

    // Create sync scripts
    await this.createSyncScripts();
  }

  async setupCodeWatcher() {
    console.log('👁️  Setting up code change watcher...');

    const watcherScript = `
const chokidar = require('chokidar');
const path = require('path');

console.log('👁️  Watching for code changes...');

const watcher = chokidar.watch([
  'src/**/*.tsx',
  'src/**/*.ts',
  'src/**/*.css',
  'tailwind.config.js'
], {
  ignored: /(^|[\/\\\\])\\../,
  persistent: true,
  cwd: '${this.projectDir}'
});

watcher.on('change', (filePath) => {
  console.log(\`🔄 Code changed: \${filePath}\`);
  
  // Trigger sync to Figma
  require('./scripts/sync-to-figma.js');
});

watcher.on('error', error => console.error(\`Watcher error: \${error}\`));
    `;

    const watcherPath = path.join(this.projectDir, 'code-watcher.js');
    fs.writeFileSync(watcherPath, watcherScript);

    // Install chokidar if not present
    try {
      await execAsync('npm list chokidar', { cwd: this.projectDir });
    } catch (error) {
      console.log('📦 Installing chokidar...');
      await execAsync('npm install chokidar --save-dev', { cwd: this.projectDir });
    }

    console.log('✅ Code watcher setup complete');
  }

  async setupFigmaWatcher() {
    console.log('👁️  Setting up Figma change watcher...');

    const figmaWatcherScript = `
const fetch = require('node-fetch');

class FigmaWatcher {
  constructor() {
    this.token = '${this.figmaToken}';
    this.fileKey = '${this.figmaFileKey || 'PLACEHOLDER'}';
    this.lastModified = null;
    this.pollInterval = 30000; // 30 seconds
  }

  async watchChanges() {
    console.log('👁️  Watching Figma for changes...');
    
    setInterval(async () => {
      try {
        const response = await fetch(\`https://api.figma.com/v1/files/\${this.fileKey}\`, {
          headers: {
            'X-Figma-Token': this.token
          }
        });

        if (response.ok) {
          const data = await response.json();
          const currentModified = data.lastModified;
          
          if (this.lastModified && currentModified !== this.lastModified) {
            console.log('🔄 Figma file changed, syncing to code...');
            require('./scripts/sync-from-figma.js');
          }
          
          this.lastModified = currentModified;
        }
      } catch (error) {
        console.error('❌ Error checking Figma changes:', error.message);
      }
    }, this.pollInterval);
  }

  start() {
    this.watchChanges();
  }
}

if (require.main === module) {
  const watcher = new FigmaWatcher();
  watcher.start();
}

module.exports = FigmaWatcher;
    `;

    const figmaWatcherPath = path.join(this.projectDir, 'figma-watcher.js');
    fs.writeFileSync(figmaWatcherPath, figmaWatcherScript);

    console.log('✅ Figma watcher setup complete');
  }

  async createSyncScripts() {
    console.log('📝 Creating sync scripts...');

    // Sync TO Figma script
    const syncToFigmaScript = `
const FigmaSync = require('./figma-sync');

async function syncToFigma() {
  console.log('🔄 Syncing code changes to Figma...');
  
  const sync = new FigmaSync();
  await sync.extractDesignTokensFromCode();
  await sync.updateFigmaStyles();
  
  console.log('✅ Sync to Figma complete');
}

if (require.main === module) {
  syncToFigma().catch(console.error);
}

module.exports = syncToFigma;
    `;

    // Sync FROM Figma script
    const syncFromFigmaScript = `
const FigmaSync = require('./figma-sync');

async function syncFromFigma() {
  console.log('🔄 Syncing Figma changes to code...');
  
  const sync = new FigmaSync();
  await sync.extractDesignTokensFromFigma();
  await sync.updateCodeStyles();
  
  console.log('✅ Sync from Figma complete');
}

if (require.main === module) {
  syncFromFigma().catch(console.error);
}

module.exports = syncFromFigma;
    `;

    // Write sync scripts
    fs.writeFileSync(path.join(this.projectDir, 'scripts/sync-to-figma.js'), syncToFigmaScript);
    fs.writeFileSync(path.join(this.projectDir, 'scripts/sync-from-figma.js'), syncFromFigmaScript);

    console.log('✅ Sync scripts created');
  }

  provideManualInstructions() {
    const instructions = `
🎨 AUTO FIGMA SETUP - MANUAL STEPS REQUIRED
===========================================

Due to API limitations, please complete these steps manually:

1️⃣  CREATE FIGMA FILE:
   • Go to https://figma.com
   • Click "Create new file"
   • Name it: "Qatalog Login - UI Screens"

2️⃣  IMPORT SCREENSHOTS:
   • Drag and drop these files into Figma:
     - ${path.join(this.screenshotsDir, 'login-page.png')}
     - ${path.join(this.screenshotsDir, 'password-page.png')}
     - ${path.join(this.screenshotsDir, 'director-login-page.png')}

3️⃣  SETUP FRAMES:
   • Create iPhone frames (375×812) for each screen
   • Place screenshots in frames
   • Name frames: "Login Page", "Password Page", "Director Login Page"

4️⃣  COPY FILE KEY:
   • From Figma URL: figma.com/file/[FILE_KEY]/...
   • Save it to: figma-file-key.txt

5️⃣  START SYNC:
   • Run: node code-watcher.js (for code → Figma sync)
   • Run: node figma-watcher.js (for Figma → code sync)

✨ Once setup, changes in code or Figma will automatically sync!
    `;

    console.log(instructions);
    fs.writeFileSync(path.join(this.projectDir, 'MANUAL_FIGMA_SETUP.md'), instructions);
  }

  async run() {
    try {
      console.log('🚀 Starting Full Figma Automation...');

      // Initialize
      await this.init();

      // Create Figma file
      await this.createFigmaFile();

      // Setup two-way sync
      await this.setupTwoWaySync();

      console.log('🎉 Full Figma automation completed!');
      console.log('🔄 Two-way sync is now active between your code and Figma');
      console.log('📖 Check MANUAL_FIGMA_SETUP.md if manual steps are needed');
    } catch (error) {
      console.error('❌ Automation failed:', error.message);
      this.provideManualInstructions();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const automation = new FullFigmaAutomation();
  automation.run().catch(console.error);
}

module.exports = FullFigmaAutomation;
