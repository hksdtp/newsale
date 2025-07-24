#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const config = require('../design-system/config');

class FigmaSync {
  constructor() {
    this.figmaToken = process.env.FIGMA_TOKEN;
    this.figmaFileKey = process.env.FIGMA_FILE_KEY;
    this.baseUrl = 'https://api.figma.com/v1';
  }

  // Fetch Figma file data
  async fetchFigmaFile() {
    if (!this.figmaToken || !this.figmaFileKey) {
      console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_KEY environment variables');
      console.log('💡 Add them to your .env file:');
      console.log('   FIGMA_TOKEN=your_figma_token');
      console.log('   FIGMA_FILE_KEY=your_figma_file_key');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/files/${this.figmaFileKey}`, {
        headers: {
          'X-Figma-Token': this.figmaToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Successfully fetched Figma file data');
      return data;
    } catch (error) {
      console.error('❌ Error fetching Figma file:', error.message);
      return null;
    }
  }

  // Extract design tokens from Figma file
  extractDesignTokens(figmaData) {
    if (!figmaData) return null;

    const tokens = {
      colors: {},
      typography: {},
      spacing: {},
      borderRadius: {},
      shadows: {},
    };

    // Extract colors from Figma styles
    if (figmaData.styles) {
      Object.values(figmaData.styles).forEach(style => {
        if (style.styleType === 'FILL') {
          // Extract color information
          tokens.colors[style.name.toLowerCase().replace(/\s+/g, '-')] = {
            value: this.extractColorValue(style),
            type: 'color',
          };
        }
      });
    }

    return tokens;
  }

  // Extract color value from Figma style
  extractColorValue(style) {
    // This is a simplified extraction - you'd need to handle various color formats
    return '#000000'; // Placeholder
  }

  // Save tokens to JSON files
  saveTokens(tokens) {
    if (!tokens) return;

    const tokensDir = path.join(__dirname, '../src/styles/tokens');

    // Ensure directory exists
    if (!fs.existsSync(tokensDir)) {
      fs.mkdirSync(tokensDir, { recursive: true });
    }

    // Save each token category
    Object.keys(tokens).forEach(category => {
      const filePath = path.join(tokensDir, `${category}.json`);
      fs.writeFileSync(filePath, JSON.stringify(tokens[category], null, 2));
      console.log(`💾 Saved ${category} tokens to ${filePath}`);
    });
  }

  // Generate Tailwind config from tokens
  generateTailwindConfig(tokens) {
    if (!tokens) return;

    const tailwindConfig = {
      theme: {
        extend: {
          colors: {},
          fontFamily: {},
          spacing: {},
          borderRadius: {},
          boxShadow: {},
        },
      },
    };

    // Convert design tokens to Tailwind format
    if (tokens.colors) {
      Object.keys(tokens.colors).forEach(colorName => {
        tailwindConfig.theme.extend.colors[colorName] = tokens.colors[colorName].value;
      });
    }

    // Save Tailwind config
    const configPath = path.join(__dirname, '../tailwind.design.config.js');
    const configContent = `// Auto-generated from Figma design tokens
module.exports = ${JSON.stringify(tailwindConfig, null, 2)};`;

    fs.writeFileSync(configPath, configContent);
    console.log('🎨 Generated Tailwind config from design tokens');
  }

  // Main sync function
  async sync() {
    console.log('🚀 Starting Figma design sync...');

    const figmaData = await this.fetchFigmaFile();
    const tokens = this.extractDesignTokens(figmaData);

    if (tokens) {
      this.saveTokens(tokens);
      this.generateTailwindConfig(tokens);
      console.log('✅ Figma sync completed successfully!');
    } else {
      console.log('❌ Figma sync failed');
    }
  }
}

// Run sync if called directly
if (require.main === module) {
  const figmaSync = new FigmaSync();
  figmaSync.sync().catch(console.error);
}

module.exports = FigmaSync;
