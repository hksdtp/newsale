// Design System Configuration for Figma Integration
module.exports = {
  // Figma Integration Settings
  figma: {
    // Add your Figma API token here
    token: process.env.FIGMA_TOKEN,
    // Add your Figma file key here
    fileKey: process.env.FIGMA_FILE_KEY,
    // Node IDs for specific components/frames
    nodeIds: {
      colors: '', // Add node ID for color palette
      typography: '', // Add node ID for typography
      components: '', // Add node ID for components
      icons: '', // Add node ID for icons
    },
  },

  // Design Tokens Export Path
  output: {
    tokens: './src/styles/tokens/',
    css: './src/styles/generated/',
    tailwind: './tailwind.design.config.js',
  },

  // Style Dictionary Configuration
  styleDict: {
    source: ['design-system/tokens/**/*.json'],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'src/styles/generated/',
        files: [
          {
            destination: 'variables.css',
            format: 'css/variables',
          },
        ],
      },
      tailwind: {
        transformGroup: 'tailwind',
        buildPath: './',
        files: [
          {
            destination: 'tailwind.design.config.js',
            format: 'tailwind/config',
          },
        ],
      },
    },
  },
};
