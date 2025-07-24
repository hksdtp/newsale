#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SimpleFigmaCreator {
  constructor() {
    this.figmaToken = process.env.FIGMA_TOKEN;
    this.baseUrl = 'https://api.figma.com/v1';
    this.projectDir = path.dirname(__dirname);
    this.screenshotsDir = path.join(this.projectDir, 'screenshots');
  }

  async createFileByDuplication() {
    console.log('🎨 Creating Figma file through duplication method...');

    try {
      // Get user info first
      const userResponse = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'X-Figma-Token': this.figmaToken,
        },
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to get user info: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      console.log(`👋 Hello ${userData.handle}!`);

      // Try to get recent files to duplicate from
      const recentResponse = await fetch(`${this.baseUrl}/files/recent`, {
        headers: {
          'X-Figma-Token': this.figmaToken,
        },
      });

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        console.log(`📁 Found ${recentData.files?.length || 0} recent files`);

        if (recentData.files && recentData.files.length > 0) {
          // Try to duplicate the first file
          const templateFile = recentData.files[0];
          console.log(`🔄 Attempting to duplicate: ${templateFile.name}`);

          // Note: Duplication might require team permissions
          const duplicateResponse = await fetch(`${this.baseUrl}/files/${templateFile.key}/copy`, {
            method: 'POST',
            headers: {
              'X-Figma-Token': this.figmaToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: 'Qatalog Login - UI Screens',
            }),
          });

          if (duplicateResponse.ok) {
            const duplicateData = await duplicateResponse.json();
            console.log('✅ File duplicated successfully!');
            console.log(`📄 New file key: ${duplicateData.key}`);

            // Save file key
            fs.writeFileSync(path.join(this.projectDir, 'figma-file-key.txt'), duplicateData.key);

            return duplicateData.key;
          } else {
            console.log('⚠️  Could not duplicate file, will use manual method');
          }
        }
      }

      // Fallback: Provide instructions for manual creation
      this.provideCreationInstructions();
      return null;
    } catch (error) {
      console.error('❌ Error in file creation:', error.message);
      this.provideCreationInstructions();
      return null;
    }
  }

  provideCreationInstructions() {
    const instructions = `
🎨 FIGMA FILE CREATION INSTRUCTIONS
===================================

Please follow these simple steps to create and setup your Figma file:

📱 STEP 1: Create Figma File
1. Go to https://figma.com
2. Click "Create new file" or press Ctrl+N
3. Rename file to: "Qatalog Login - UI Screens"

📷 STEP 2: Import Screenshots
Drag these screenshots into your Figma file:
• ${path.join(this.screenshotsDir, 'login-page.png')}
• ${path.join(this.screenshotsDir, 'password-page.png')}
• ${path.join(this.screenshotsDir, 'director-login-page.png')}

📐 STEP 3: Create Frames
1. Create 3 iPhone frames (375×812px)
2. Name them:
   - "Login Page"
   - "Password Page" 
   - "Director Login Page"
3. Place each screenshot in its corresponding frame

🔗 STEP 4: Get File Key
1. Copy the Figma URL: figma.com/file/[FILE_KEY]/...
2. Extract the FILE_KEY part
3. Save it to: figma-file-key.txt in your project root

🚀 STEP 5: Start Sync Services
Once you have the file key, run these commands:

Terminal 1 (Code → Figma sync):
cd "${this.projectDir}"
node code-watcher.js

Terminal 2 (Figma → Code sync):
cd "${this.projectDir}"
node figma-watcher.js

✨ STEP 6: Test the Sync
1. Make a change to any React component
2. Check Figma for automatic updates
3. Make a change in Figma
4. Check your code for automatic updates

🎯 DESIGN TOKENS AVAILABLE:
• Colors: Primary blue, Gray scales
• Typography: Text sizes and weights
• Spacing: Margin and padding values
• Border radius: Rounded corners
• Shadows: Drop shadows

📊 SYNC FEATURES:
✅ Automatic screenshot generation
✅ Design token extraction from code
✅ Component mapping
✅ Two-way synchronization
✅ File change monitoring

💡 TROUBLESHOOTING:
- If sync doesn't work, check figma-file-key.txt exists
- Ensure FIGMA_TOKEN is valid in .env.local
- Check console output for error messages

🎉 Once setup, you can edit in either Figma or code and changes will sync automatically!
    `;

    console.log(instructions);
    fs.writeFileSync(path.join(this.projectDir, 'FIGMA_CREATION_GUIDE.md'), instructions);
  }

  async checkExistingFile() {
    const fileKeyPath = path.join(this.projectDir, 'figma-file-key.txt');

    if (fs.existsSync(fileKeyPath)) {
      const fileKey = fs.readFileSync(fileKeyPath, 'utf8').trim();
      console.log(`📄 Found existing file key: ${fileKey}`);

      // Verify file exists
      try {
        const response = await fetch(`${this.baseUrl}/files/${fileKey}`, {
          headers: {
            'X-Figma-Token': this.figmaToken,
          },
        });

        if (response.ok) {
          const fileData = await response.json();
          console.log(`✅ Verified file: ${fileData.name}`);
          console.log(
            `🔗 URL: https://www.figma.com/file/${fileKey}/${encodeURIComponent(fileData.name)}`
          );
          return fileKey;
        } else {
          console.log('⚠️  File key invalid, will create new file');
          fs.unlinkSync(fileKeyPath);
        }
      } catch (error) {
        console.log('⚠️  Could not verify file, will create new one');
      }
    }

    return null;
  }

  async run() {
    console.log('🚀 Simple Figma Creator starting...');

    // Check if file already exists
    const existingFileKey = await this.checkExistingFile();

    if (existingFileKey) {
      console.log('✅ Figma file already exists and is ready for sync!');
      console.log('🔄 Start watchers with:');
      console.log('   node code-watcher.js');
      console.log('   node figma-watcher.js');
      return existingFileKey;
    }

    // Try to create new file
    const newFileKey = await this.createFileByDuplication();

    if (newFileKey) {
      console.log('🎉 Figma file created successfully!');
      console.log('🔄 Two-way sync is ready!');
    } else {
      console.log('📖 Please follow the manual instructions in FIGMA_CREATION_GUIDE.md');
    }

    return newFileKey;
  }
}

// Run if called directly
if (require.main === module) {
  const creator = new SimpleFigmaCreator();
  creator.run().catch(console.error);
}

module.exports = SimpleFigmaCreator;
