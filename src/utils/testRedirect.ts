// Simple utility to test redirect functionality
export function testRedirect() {
  console.log('Testing redirect functionality...');
  
  // Test if current URL is /auth/login and should redirect
  if (window.location.pathname === '/auth/login') {
    console.log('Current path is /auth/login - should redirect to /auth/region-selection');
    window.location.href = '/auth/region-selection';
    return true;
  }
  
  console.log('Current path:', window.location.pathname);
  return false;
}

// Auto-test on load if in browser
if (typeof window !== 'undefined') {
  console.log('Redirect test utility loaded');
}
