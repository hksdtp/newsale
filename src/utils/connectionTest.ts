import { checkSupabaseConnection } from '../shared/api/supabase';

// 🔍 Connection diagnostic utility
export const runConnectionDiagnostics = async (): Promise<{
  isHealthy: boolean;
  latency: number;
  error?: string;
}> => {
  const startTime = Date.now();
  
  try {
    const isHealthy = await checkSupabaseConnection();
    const latency = Date.now() - startTime;
    
    console.log(`🔍 Connection diagnostics:`, {
      isHealthy,
      latency: `${latency}ms`,
      status: isHealthy ? '✅ Healthy' : '❌ Unhealthy'
    });
    
    return { isHealthy, latency };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ Connection diagnostics failed:`, {
      error: errorMessage,
      latency: `${latency}ms`
    });
    
    return { 
      isHealthy: false, 
      latency, 
      error: errorMessage 
    };
  }
};

// 🚀 Pre-flight check before creating tasks
export const preflightCheck = async (): Promise<boolean> => {
  console.log('🛫 Running preflight check...');
  
  const diagnostics = await runConnectionDiagnostics();
  
  if (!diagnostics.isHealthy) {
    console.error('❌ Preflight check failed:', diagnostics.error);
    return false;
  }
  
  if (diagnostics.latency > 10000) { // 10 seconds
    console.warn('⚠️ High latency detected:', `${diagnostics.latency}ms`);
    return false;
  }
  
  console.log('✅ Preflight check passed');
  return true;
};
