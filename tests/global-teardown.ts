import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Add any cleanup logic here
  // For example, clearing test data, stopping services, etc.
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;
