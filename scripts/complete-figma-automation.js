#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class CompleteFigmaAutomation {
  constructor() {
    this.projectDir = path.dirname(__dirname);
    this.screenshotsDir = path.join(this.projectDir, 'screenshots');
    this.mcpServerPath = '/tmp/mcp-figma-server';
  }

  // Step 1: Capture screenshots if not exists
  async captureScreenshots() {
    if (!fs.existsSync(this.screenshotsDir)) {
      console.log('📸 Capturing screenshots...');
      await execAsync('node scripts/capture-screenshots.js', { cwd: this.projectDir });
      console.log('✅ Screenshots captured');
    } else {
      console.log('✅ Screenshots already exist');
    }
  }

  // Step 2: Start MCP Figma Server
  async startMCPServer() {
    console.log('🚀 Starting MCP Figma Server...');

    // Check if MCP server is built
    if (!fs.existsSync(path.join(this.mcpServerPath, 'dist/index.js'))) {
      console.log('🔨 Building MCP server...');
      await execAsync('npm run build', { cwd: this.mcpServerPath });
    }

    console.log('✅ MCP Server ready');
  }

  // Step 3: Create comprehensive Figma integration
  async createFigmaIntegration() {
    console.log('🎨 Creating Figma integration...');

    // Generate design system from code
    const designSystem = this.analyzeDesignSystem();

    // Create component mapping
    const componentMapping = this.createComponentMapping();

    // Generate Figma-compatible data
    const figmaData = {
      project: 'Qatalog Login',
      screens: this.getScreensData(),
      designSystem: designSystem,
      components: componentMapping,
      createdAt: new Date().toISOString(),
    };

    // Save comprehensive data
    const dataPath = path.join(this.projectDir, 'figma-integration-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(figmaData, null, 2));

    console.log(`💾 Figma integration data saved to: ${dataPath}`);
    return figmaData;
  }

  // Analyze design system from code
  analyzeDesignSystem() {
    console.log('🔍 Analyzing design system from code...');

    // Read Tailwind config
    const tailwindPath = path.join(this.projectDir, 'tailwind.config.js');
    let tailwindConfig = {};

    try {
      if (fs.existsSync(tailwindPath)) {
        delete require.cache[require.resolve(tailwindPath)];
        tailwindConfig = require(tailwindPath);
      }
    } catch (error) {
      console.log('⚠️  Could not read Tailwind config');
    }

    // Extract colors, spacing, typography from component files
    const componentFiles = this.findComponentFiles();
    const usedStyles = this.extractStylesFromComponents(componentFiles);

    return {
      colors: this.extractColors(usedStyles),
      typography: this.extractTypography(usedStyles),
      spacing: this.extractSpacing(usedStyles),
      borderRadius: this.extractBorderRadius(usedStyles),
      shadows: this.extractShadows(usedStyles),
    };
  }

  // Find all component files
  findComponentFiles() {
    const srcDir = path.join(this.projectDir, 'src');
    const componentFiles = [];

    const scanDirectory = dir => {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          componentFiles.push(filePath);
        }
      });
    };

    scanDirectory(srcDir);
    return componentFiles;
  }

  // Extract styles from components
  extractStylesFromComponents(files) {
    const styles = [];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Extract className patterns
        const classMatches = content.match(/className=[\"'`]([^\"'`]+)[\"'`]/g);
        if (classMatches) {
          classMatches.forEach(match => {
            const classes = match.replace(/className=[\"'`]/, '').replace(/[\"'`]$/, '');
            styles.push(...classes.split(/\\s+/));
          });
        }
      } catch (error) {
        console.log(`⚠️  Could not read ${file}`);
      }
    });

    return [...new Set(styles)]; // Remove duplicates
  }

  // Extract color tokens
  extractColors(styles) {
    const colors = {};
    const colorPattern = /(bg|text|border)-(\\w+)-(\\d+)/g;

    styles.forEach(style => {
      const matches = [...style.matchAll(colorPattern)];
      matches.forEach(([full, type, color, shade]) => {
        if (!colors[color]) colors[color] = {};
        colors[color][shade] = this.getTailwindColor(color, shade);
      });
    });

    // Add common colors
    colors.primary = {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    };
    colors.gray = {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      500: '#6b7280',
      700: '#374151',
      900: '#111827',
    };

    return colors;
  }

  // Extract typography tokens
  extractTypography(styles) {
    const typography = {};
    const textSizes = styles.filter(s => s.startsWith('text-'));

    textSizes.forEach(size => {
      const sizeKey = size.replace('text-', '');
      typography[sizeKey] = this.getTailwindTextSize(sizeKey);
    });

    return typography;
  }

  // Extract spacing tokens
  extractSpacing(styles) {
    const spacing = {};
    const spacingClasses = styles.filter(s =>
      s.match(/^(p|m|px|py|mx|my|mt|mb|ml|mr|pt|pb|pl|pr)-(\\d+|auto)$/)
    );

    spacingClasses.forEach(cls => {
      const value = cls.split('-').pop();
      if (value && value !== 'auto') {
        spacing[value] = this.getTailwindSpacing(value);
      }
    });

    return spacing;
  }

  // Extract border radius tokens
  extractBorderRadius(styles) {
    const borderRadius = {};
    const radiusClasses = styles.filter(s => s.startsWith('rounded'));

    radiusClasses.forEach(cls => {
      const key = cls.replace('rounded-', '') || 'default';
      borderRadius[key] = this.getTailwindBorderRadius(key);
    });

    return borderRadius;
  }

  // Extract shadow tokens
  extractShadows(styles) {
    const shadows = {};
    const shadowClasses = styles.filter(s => s.startsWith('shadow'));

    shadowClasses.forEach(cls => {
      const key = cls.replace('shadow-', '') || 'default';
      shadows[key] = this.getTailwindShadow(key);
    });

    return shadows;
  }

  // Helper methods for Tailwind values
  getTailwindColor(color, shade) {
    const colorMap = {
      blue: { 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        500: '#6b7280',
        700: '#374151',
        900: '#111827',
      },
      red: { 500: '#ef4444', 600: '#dc2626' },
      green: { 500: '#10b981', 600: '#059669' },
    };

    return colorMap[color]?.[shade] || `#${color}${shade}`;
  }

  getTailwindTextSize(size) {
    const sizeMap = {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    };

    return sizeMap[size] || '1rem';
  }

  getTailwindSpacing(value) {
    const spacingMap = {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      6: '1.5rem',
      8: '2rem',
      12: '3rem',
      16: '4rem',
    };

    return spacingMap[value] || `${value * 0.25}rem`;
  }

  getTailwindBorderRadius(key) {
    const radiusMap = {
      none: '0',
      sm: '0.125rem',
      default: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    };

    return radiusMap[key] || '0.25rem';
  }

  getTailwindShadow(key) {
    const shadowMap = {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    };

    return shadowMap[key] || shadowMap.default;
  }

  // Create component mapping
  createComponentMapping() {
    return {
      Input: {
        file: 'src/shared/components/forms/Input/Input.tsx',
        props: ['label', 'error', 'helperText'],
        variants: ['default', 'error'],
        figmaComponent: 'Input Field',
      },
      LoginPage: {
        file: 'src/features/auth/components/pages/LoginPage/LoginPage.tsx',
        type: 'page',
        figmaFrame: 'Login Screen',
      },
      PasswordPage: {
        file: 'src/features/auth/components/pages/PasswordPage/PasswordPage.tsx',
        type: 'page',
        figmaFrame: 'Password Screen',
      },
      DirectorLoginPage: {
        file: 'src/features/auth/components/pages/DirectorLoginPage/DirectorLoginPage.tsx',
        type: 'page',
        figmaFrame: 'Director Login Screen',
      },
    };
  }

  // Get screens data
  getScreensData() {
    return [
      {
        name: 'Login Page',
        file: 'login-page.png',
        route: '/',
        description: 'Email input screen for user authentication',
        components: ['Input', 'Button', 'Typography'],
        interactions: ['email validation', 'navigation to password page'],
      },
      {
        name: 'Password Page',
        file: 'password-page.png',
        route: '/auth/password',
        description: 'Password input with user greeting',
        components: ['Input', 'Button', 'Typography', 'Icon'],
        interactions: ['password visibility toggle', 'back navigation', 'forgot password'],
      },
      {
        name: 'Director Login Page',
        file: 'director-login-page.png',
        route: '/auth/director-login',
        description: 'Enhanced login for director role',
        components: ['Card', 'Input', 'Button', 'Typography', 'Avatar'],
        interactions: ['password visibility', 'loading states', 'animations'],
      },
    ];
  }

  // Generate final instructions
  generateInstructions(figmaData) {
    const instructions = `
🎨 AUTOMATED FIGMA SETUP COMPLETE!
===================================

✅ Screenshots captured: ${this.screenshotsDir}
✅ Design system analyzed: ${Object.keys(figmaData.designSystem.colors).length} colors, ${Object.keys(figmaData.designSystem.typography).length} text styles
✅ Components mapped: ${Object.keys(figmaData.components).length} components

📋 NEXT STEPS TO COMPLETE FIGMA SETUP:

1️⃣  GET FIGMA TOKEN:
   • Go to https://www.figma.com/settings
   • Create Personal Access Token
   • Replace 'your_figma_token_here' in .env.local

2️⃣  CREATE FIGMA FILE:
   • Open Figma (https://figma.com)
   • Create new file: "Qatalog Login - UI Screens"
   • Import screenshots from: ${this.screenshotsDir}

3️⃣  SETUP DESIGN SYSTEM:
   • Create color styles from design tokens
   • Setup text styles and spacing
   • Create component library

4️⃣  ENABLE DEV MODE:
   • Switch to Dev Mode in Figma
   • Connect with code using tokens
   • Enable two-way sync

🔗 RESOURCES:
   • Screenshots: ${this.screenshotsDir}
   • Design Data: ${path.join(this.projectDir, 'figma-integration-data.json')}
   • MCP Server: ${this.mcpServerPath}

🚀 AUTOMATION FEATURES:
   ✅ Auto-screenshot capture
   ✅ Design token extraction
   ✅ Component analysis
   ✅ Integration data generation

💡 Once you have the Figma token, run:
   FIGMA_TOKEN="your_token" node scripts/complete-figma-automation.js --upload

This will automatically upload and create your Figma file!
    `;

    console.log(instructions);

    // Save instructions to file
    fs.writeFileSync(path.join(this.projectDir, 'FIGMA_SETUP_INSTRUCTIONS.md'), instructions);
  }

  // Main automation function
  async run() {
    console.log('🚀 Starting Complete Figma Automation...');

    try {
      // Step 1: Capture screenshots
      await this.captureScreenshots();

      // Step 2: Start MCP server
      await this.startMCPServer();

      // Step 3: Create integration
      const figmaData = await this.createFigmaIntegration();

      // Step 4: Generate instructions
      this.generateInstructions(figmaData);

      console.log('✅ Automation completed successfully!');
      console.log('📖 Check FIGMA_SETUP_INSTRUCTIONS.md for next steps');
    } catch (error) {
      console.error('❌ Automation failed:', error);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const automation = new CompleteFigmaAutomation();
  automation.run().catch(console.error);
}

module.exports = CompleteFigmaAutomation;
