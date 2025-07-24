#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

class AutoFigmaSync {
  constructor() {
    this.figmaToken = process.env.FIGMA_TOKEN;
    this.baseUrl = 'https://api.figma.com/v1';
    this.screenshotsDir = path.join(__dirname, '../screenshots');
    this.teamId = null; // Will be fetched automatically
    this.fileKey = null;
  }

  async init() {
    if (!this.figmaToken) {
      console.error('❌ Missing FIGMA_TOKEN environment variable');
      console.log('💡 Please set your Figma token:');
      console.log('   export FIGMA_TOKEN="your_figma_token_here"');
      console.log('   Or add it to your .env file');
      return false;
    }
    return true;
  }

  // Get user info and team
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

      // Get first team
      if (data.teams && data.teams.length > 0) {
        this.teamId = data.teams[0].id;
        console.log(`🏢 Using team: ${data.teams[0].name}`);
      } else {
        console.log('⚠️  No teams found, will create in personal space');
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting user info:', error.message);
      return null;
    }
  }

  // Create new Figma project
  async createProject() {
    if (!this.teamId) {
      console.log('📁 Creating file in personal space...');
      return await this.createFile();
    }

    try {
      const response = await fetch(`${this.baseUrl}/teams/${this.teamId}/projects`, {
        method: 'POST',
        headers: {
          'X-Figma-Token': this.figmaToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Qatalog Login Project',
        }),
      });

      if (!response.ok) {
        console.log('ℹ️  Could not create project, creating file directly...');
        return await this.createFile();
      }

      const project = await response.json();
      console.log(`📁 Created project: ${project.name}`);
      return project;
    } catch (error) {
      console.log('ℹ️  Creating file directly...');
      return await this.createFile();
    }
  }

  // Create new Figma file
  async createFile() {
    try {
      // Create file content structure
      const fileData = {
        name: 'Qatalog Login - UI Screens',
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
          children: [
            {
              id: '1:0',
              name: 'Page 1',
              type: 'CANVAS',
              children: [],
              backgroundColor: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
              prototypeStartNodeID: null,
              flowStartingPoints: [],
              prototypeDevice: {
                type: 'NONE',
                rotation: 'NONE',
              },
            },
          ],
        },
      };

      // Note: Figma REST API doesn't directly support file creation with content
      // We'll use a different approach - duplicate a template or use Figma Web API

      console.log('📄 Creating Figma file...');
      console.log('ℹ️  Due to Figma API limitations, creating frames programmatically...');

      // Alternative: Create via team files if possible
      if (this.teamId) {
        const response = await fetch(`${this.baseUrl}/teams/${this.teamId}/projects`, {
          headers: {
            'X-Figma-Token': this.figmaToken,
          },
        });

        if (response.ok) {
          const projects = await response.json();
          if (projects.projects && projects.projects.length > 0) {
            // Use first project
            const projectId = projects.projects[0].id;
            return await this.createFileInProject(projectId);
          }
        }
      }

      // Fallback: Provide manual instructions
      const instructions = this.generateManualInstructions();
      console.log(instructions);

      return null;
    } catch (error) {
      console.error('❌ Error creating Figma file:', error.message);
      return null;
    }
  }

  // Create file in specific project
  async createFileInProject(projectId) {
    try {
      // This would require Figma for Teams API access
      console.log(`📁 Project ID: ${projectId}`);
      console.log('ℹ️  Manual file creation required due to API limitations');
      return null;
    } catch (error) {
      console.error('❌ Error creating file in project:', error.message);
      return null;
    }
  }

  // Upload images to Figma
  async uploadImages() {
    const screenshots = fs.readdirSync(this.screenshotsDir).filter(file => file.endsWith('.png'));

    const uploadedImages = [];

    for (const screenshot of screenshots) {
      const imagePath = path.join(this.screenshotsDir, screenshot);
      console.log(`📤 Uploading ${screenshot}...`);

      try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));

        const response = await fetch(`${this.baseUrl}/images`, {
          method: 'POST',
          headers: {
            'X-Figma-Token': this.figmaToken,
            ...formData.getHeaders(),
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedImages.push({
            name: screenshot,
            url: result.images,
            hash: result.images ? Object.keys(result.images)[0] : null,
          });
          console.log(`✅ Uploaded ${screenshot}`);
        } else {
          console.error(`❌ Failed to upload ${screenshot}: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error uploading ${screenshot}:`, error.message);
      }
    }

    return uploadedImages;
  }

  // Generate manual instructions
  generateManualInstructions() {
    const screenshotPaths = fs
      .readdirSync(this.screenshotsDir)
      .map(file => path.join(this.screenshotsDir, file));

    return `
🎨 FIGMA SETUP INSTRUCTIONS
==========================

Due to Figma API limitations, please follow these steps to complete the setup:

📋 Step 1: Create Figma File
1. Open Figma (https://figma.com)
2. Click "Create new file"
3. Name it: "Qatalog Login - UI Screens"

📋 Step 2: Import Screenshots
Upload these screenshots to your Figma file:
${screenshotPaths.map(p => `   • ${p}`).join('\n')}

📋 Step 3: Setup Frames
Create frames for each screen:
   • Login Page (375×812 iPhone frame)
   • Password Page (375×812 iPhone frame)  
   • Director Login Page (375×812 iPhone frame)

📋 Step 4: Apply Design System
Use the design tokens from: design-docs/README.md

📋 Step 5: Enable Dev Mode
1. Switch to Dev Mode in Figma
2. Export design tokens and CSS

🔗 Quick Links:
   • Screenshots: ${this.screenshotsDir}
   • Design Docs: ${path.join(__dirname, '../design-docs')}
   • Figma: https://figma.com

✨ Once setup is complete, you can edit the design in Figma and sync back to code!
    `;
  }

  // Generate Figma file creation script
  generateFigmaScript() {
    const scriptContent = `
// Figma Plugin Script - Run in Figma console
// This script creates frames and imports your screenshots

const screenshots = [
  { name: 'Login Page', file: 'login-page.png', width: 375, height: 812 },
  { name: 'Password Page', file: 'password-page.png', width: 375, height: 812 },
  { name: 'Director Login Page', file: 'director-login-page.png', width: 375, height: 812 }
];

// Create frames
screenshots.forEach((screen, index) => {
  const frame = figma.createFrame();
  frame.name = screen.name;
  frame.resize(screen.width, screen.height);
  frame.x = index * (screen.width + 50);
  frame.y = 0;
  
  // Add to current page
  figma.currentPage.appendChild(frame);
  
  console.log(\`Created frame: \${screen.name}\`);
});

figma.notify('Frames created! Now import your screenshots manually.');
`;

    const scriptPath = path.join(__dirname, '../figma-setup-script.js');
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`📝 Figma plugin script saved to: ${scriptPath}`);

    return scriptPath;
  }

  // Main sync function
  async sync() {
    console.log('🚀 Starting automated Figma sync...');

    if (!(await this.init())) {
      return;
    }

    // Get user info
    const userInfo = await this.getUserInfo();
    if (!userInfo) {
      return;
    }

    // Check screenshots
    if (!fs.existsSync(this.screenshotsDir)) {
      console.error('❌ Screenshots not found. Run capture-screenshots.js first.');
      return;
    }

    // Upload images (this works with any file)
    console.log('📤 Uploading screenshots to Figma...');
    const uploadedImages = await this.uploadImages();

    if (uploadedImages.length > 0) {
      console.log(`✅ Uploaded ${uploadedImages.length} screenshots to Figma`);
      console.log('🔗 Image URLs:', uploadedImages);
    }

    // Create project/file
    await this.createProject();

    // Generate helper scripts
    this.generateFigmaScript();

    // Show final instructions
    console.log(this.generateManualInstructions());

    console.log('🎉 Figma sync process completed!');
    console.log('💡 Check the instructions above to complete the setup in Figma.');
  }
}

// Run if called directly
if (require.main === module) {
  const sync = new AutoFigmaSync();
  sync.sync().catch(console.error);
}

module.exports = AutoFigmaSync;
