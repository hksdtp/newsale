const StyleDictionary = require('style-dictionary');

// Custom transform for Tailwind CSS variables
StyleDictionary.registerTransform({
  name: 'name/kebab',
  type: 'name',
  transformer: function (token) {
    return token.path.join('-');
  },
});

// Custom format for Tailwind config
StyleDictionary.registerFormat({
  name: 'tailwind/config',
  formatter: function (dictionary) {
    const colors = {};
    const spacing = {};
    const borderRadius = {};
    const boxShadow = {};

    dictionary.allTokens.forEach(token => {
      const path = token.path;
      const value = token.value;

      if (path[0] === 'colors') {
        colors[path[1]] = value;
      } else if (path[0] === 'spacing') {
        spacing[path[1]] = value;
      } else if (path[0] === 'borderRadius') {
        borderRadius[path[1]] = value;
      } else if (path[0] === 'shadows') {
        boxShadow[path[1]] = value;
      }
    });

    return `// Auto-generated from Figma design tokens
module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6)},
      spacing: ${JSON.stringify(spacing, null, 6)},
      borderRadius: ${JSON.stringify(borderRadius, null, 6)},
      boxShadow: ${JSON.stringify(boxShadow, null, 6)}
    }
  }
};`;
  },
});

module.exports = {
  source: ['design-system/tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/generated/',
      files: [
        {
          destination: 'design-tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    tailwind: {
      transformGroup: 'web',
      buildPath: './',
      files: [
        {
          destination: 'tailwind.design.config.js',
          format: 'tailwind/config',
        },
      ],
    },
    json: {
      transformGroup: 'web',
      buildPath: 'src/styles/tokens/',
      files: [
        {
          destination: 'design-tokens.json',
          format: 'json/flat',
        },
      ],
    },
  },
};
