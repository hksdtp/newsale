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
