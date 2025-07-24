const fetch = require('node-fetch');

class FigmaWatcher {
  constructor() {
    this.token = process.env.FIGMA_TOKEN;
    this.fileKey = 'PLACEHOLDER';
    this.lastModified = null;
    this.pollInterval = 30000; // 30 seconds
  }

  async watchChanges() {
    console.log('👁️  Watching Figma for changes...');

    setInterval(async () => {
      try {
        const response = await fetch(`https://api.figma.com/v1/files/${this.fileKey}`, {
          headers: {
            'X-Figma-Token': this.token,
          },
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
