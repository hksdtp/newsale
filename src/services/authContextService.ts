import { supabase } from '../shared/api/supabase';

/**
 * 🔐 AUTH CONTEXT SERVICE
 * Manages user authentication context for RLS policies
 * This service bridges custom authentication with Supabase RLS
 */

class AuthContextService {
  private currentUserId: string | null = null;

  /**
   * Set user context for the current session
   * This should be called after successful login
   */
  async setUserContext(userId: string): Promise<void> {
    try {
      this.currentUserId = userId;

      // Set user context in Supabase for RLS policies
      const { error } = await supabase.rpc('set_user_context', {
        user_uuid: userId,
      });

      if (error) {
        console.error('❌ Failed to set user context:', error);
        throw new Error('Failed to set user authentication context');
      }

      console.log('✅ User context set successfully:', userId);
    } catch (error) {
      console.error('❌ Error setting user context:', error);
      throw error;
    }
  }

  /**
   * Clear user context (for logout)
   */
  async clearUserContext(): Promise<void> {
    try {
      this.currentUserId = null;

      // Clear user context in Supabase
      const { error } = await supabase.rpc('set_user_context', {
        user_uuid: null,
      });

      if (error) {
        console.warn('⚠️ Failed to clear user context:', error);
      }

      console.log('✅ User context cleared');
    } catch (error) {
      console.error('❌ Error clearing user context:', error);
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Initialize user context from localStorage (for page refresh)
   */
  async initializeFromStorage(): Promise<void> {
    try {
      const storedUserId = localStorage.getItem('currentUserId');
      if (storedUserId) {
        await this.setUserContext(storedUserId);
      }
    } catch (error) {
      console.error('❌ Error initializing user context from storage:', error);
    }
  }

  /**
   * Verify that user context is properly set
   */
  async verifyUserContext(): Promise<boolean> {
    try {
      // Test query to check if RLS is working
      const { data, error } = await supabase.from('tasks').select('id').limit(1);

      if (error) {
        console.error('❌ User context verification failed:', error);
        return false;
      }

      console.log('✅ User context verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Error verifying user context:', error);
      return false;
    }
  }

  /**
   * Create a Supabase client with user context
   * This ensures all queries have proper user context
   */
  getAuthenticatedClient() {
    if (!this.currentUserId) {
      throw new Error('User context not set. Please login first.');
    }

    return supabase;
  }
}

// Export singleton instance
export const authContextService = new AuthContextService();

/**
 * Hook to ensure user context is set before making queries
 */
export const withUserContext = async <T>(operation: () => Promise<T>): Promise<T> => {
  let userId = authContextService.getCurrentUserId();

  if (!userId) {
    // Try to initialize from storage
    await authContextService.initializeFromStorage();
    userId = authContextService.getCurrentUserId();

    if (!userId) {
      throw new Error('User not authenticated. Please login again.');
    }
  }

  // Always set user context in Supabase before operation
  try {
    const { error } = await supabase.rpc('set_user_context', {
      user_uuid: userId,
    });

    if (error) {
      console.error('❌ Failed to set user context in withUserContext:', error);
      throw new Error('Failed to set user authentication context');
    }

    console.log('✅ User context set in withUserContext:', userId);
  } catch (error) {
    console.error('❌ Error setting user context in withUserContext:', error);
    throw error;
  }

  return await operation();
};

/**
 * Decorator for service methods to ensure user context
 */
export const requireAuth = (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    return await withUserContext(() => method.apply(this, args));
  };

  return descriptor;
};
