const chokidar = require('chokidar');
const path = require('path');

console.log('👁️  Watching for code changes...');

const watcher = chokidar.watch(
  ['src/**/*.tsx', 'src/**/*.ts', 'src/**/*.css', 'tailwind.config.js'],
  {
    ignored: /(^|[/\\])\../,
    persistent: true,
    cwd: '/Users/nih/web app/webapp/BLN/qatalog-login',
  }
);

watcher.on('change', filePath => {
  console.log(`🔄 Code changed: ${filePath}`);

  // Trigger sync to Figma
  require('./scripts/sync-to-figma.js');
});

watcher.on('error', error => console.error(`Watcher error: ${error}`));
