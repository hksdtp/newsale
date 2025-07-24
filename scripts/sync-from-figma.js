const FigmaSync = require('./figma-sync');

async function syncFromFigma() {
  console.log('🔄 Syncing Figma changes to code...');

  const sync = new FigmaSync();
  await sync.extractDesignTokensFromFigma();
  await sync.updateCodeStyles();

  console.log('✅ Sync from Figma complete');
}

if (require.main === module) {
  syncFromFigma().catch(console.error);
}

module.exports = syncFromFigma;
