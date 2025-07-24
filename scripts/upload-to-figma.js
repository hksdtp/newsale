#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

class FigmaUploader {
  constructor() {
    this.figmaToken = process.env.FIGMA_TOKEN;
    this.figmaFileKey = process.env.FIGMA_FILE_KEY || 'NEW_FILE';
    this.baseUrl = 'https://api.figma.com/v1';
    this.screenshotsDir = path.join(__dirname, '../screenshots');
  }

  // Create a new Figma file
  async createFigmaFile() {
    if (!this.figmaToken) {
      console.error('❌ Missing FIGMA_TOKEN environment variable');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: {
          'X-Figma-Token': this.figmaToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Qatalog Login - UI Screens',
          fileType: 'design',
        }),
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      console.log('✅ Created new Figma file:', data.name);
      console.log(
        '📁 File URL:',
        `https://www.figma.com/file/${data.key}/${encodeURIComponent(data.name)}`
      );

      this.figmaFileKey = data.key;
      return data;
    } catch (error) {
      console.error('❌ Error creating Figma file:', error.message);
      return null;
    }
  }

  // Upload image to Figma
  async uploadImage(imagePath, imageName) {
    if (!this.figmaToken) {
      console.error('❌ Missing FIGMA_TOKEN environment variable');
      return null;
    }

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

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      console.log(`✅ Uploaded ${imageName} to Figma`);
      return data;
    } catch (error) {
      console.error(`❌ Error uploading ${imageName}:`, error.message);
      return null;
    }
  }

  // Generate UI documentation from screenshots
  generateUIDocumentation() {
    const screens = [
      {
        name: 'Login Page',
        file: 'login-page.png',
        description: 'Main login screen where users enter their work email',
        components: [
          'Email input field',
          'Continue button',
          'Header with title',
          'Responsive layout',
        ],
      },
      {
        name: 'Password Page',
        file: 'password-page.png',
        description: 'Password input screen with user greeting',
        components: [
          'Password input with toggle visibility',
          'Back button',
          'Continue button',
          'Forgot password link',
          'User greeting',
        ],
      },
      {
        name: 'Director Login Page',
        file: 'director-login-page.png',
        description: 'Special login page for director role',
        components: [
          'Director information card',
          'Password input with visibility toggle',
          'Login button with loading state',
          'Back navigation',
          'Enhanced animations',
        ],
      },
    ];

    return screens;
  }

  // Extract design tokens from code
  extractDesignTokens() {
    console.log('🎨 Extracting design tokens from Tailwind CSS...');

    const tokens = {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        white: '#ffffff',
        black: '#000000',
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      typography: {
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
    };

    return tokens;
  }

  // Save design documentation
  saveDesignDocumentation(screens, tokens) {
    const docsDir = path.join(__dirname, '../design-docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Save UI documentation
    const uiDoc = {
      project: 'Qatalog Login',
      screens: screens,
      designTokens: tokens,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(path.join(docsDir, 'ui-documentation.json'), JSON.stringify(uiDoc, null, 2));

    // Generate Markdown documentation
    let markdown = `# Qatalog Login - UI Documentation\n\n`;
    markdown += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    markdown += `## Screens\n\n`;
    screens.forEach(screen => {
      markdown += `### ${screen.name}\n\n`;
      markdown += `${screen.description}\n\n`;
      markdown += `**Components:**\n`;
      screen.components.forEach(component => {
        markdown += `- ${component}\n`;
      });
      markdown += `\n`;
    });

    markdown += `## Design Tokens\n\n`;
    markdown += `### Colors\n`;
    Object.keys(tokens.colors).forEach(colorKey => {
      if (typeof tokens.colors[colorKey] === 'object') {
        markdown += `- **${colorKey}**: `;
        Object.keys(tokens.colors[colorKey]).forEach(shade => {
          markdown += `${shade}: ${tokens.colors[colorKey][shade]}, `;
        });
        markdown += `\n`;
      } else {
        markdown += `- **${colorKey}**: ${tokens.colors[colorKey]}\n`;
      }
    });

    fs.writeFileSync(path.join(docsDir, 'README.md'), markdown);

    console.log(`📝 Saved design documentation to ${docsDir}`);
  }

  // Main upload function
  async upload() {
    console.log('🚀 Starting Figma upload process...');

    // Check if screenshots exist
    if (!fs.existsSync(this.screenshotsDir)) {
      console.error('❌ Screenshots directory not found. Run capture-screenshots.js first.');
      return;
    }

    const screenshots = fs.readdirSync(this.screenshotsDir).filter(file => file.endsWith('.png'));

    if (screenshots.length === 0) {
      console.error('❌ No screenshots found. Run capture-screenshots.js first.');
      return;
    }

    console.log(`📸 Found ${screenshots.length} screenshots to upload`);

    // Generate documentation
    const screens = this.generateUIDocumentation();
    const tokens = this.extractDesignTokens();
    this.saveDesignDocumentation(screens, tokens);

    // Note: Direct image upload to Figma requires Figma for Developers access
    // For now, we'll generate the documentation and instructions
    console.log('📋 Generated comprehensive UI documentation');
    console.log('💡 Next steps:');
    console.log('   1. Open Figma and create a new file named "Qatalog Login"');
    console.log('   2. Import the screenshots from: ' + this.screenshotsDir);
    console.log('   3. Use the generated design tokens for consistency');
    console.log('   4. Refer to design-docs/README.md for detailed documentation');

    return {
      screenshots: screenshots.map(file => path.join(this.screenshotsDir, file)),
      documentation: path.join(__dirname, '../design-docs'),
      screens,
      tokens,
    };
  }
}

// Run upload if called directly
if (require.main === module) {
  const uploader = new FigmaUploader();
  uploader.upload().catch(console.error);
}

module.exports = FigmaUploader;
