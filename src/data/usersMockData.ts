// Mock user data for testing task scope functionality
export interface MockUser {
  id: string;
  name: string;
  email: string;
  team_id: string;
  location: 'Hà Nội' | 'Hồ Chí Minh';
  role: 'employee' | 'team_leader' | 'retail_director';
  team?: {
    id: string;
    name: string;
    location: 'HN' | 'HCM';
  };
}

export interface MockTeam {
  id: string;
  name: string;
  location: 'HN' | 'HCM';
  leader_id: string;
}

// Mock teams data - CLEARED (was incorrect data)
export const mockTeams: MockTeam[] = [
  // Data will be loaded from Supabase database
];

// Mock users data - CLEARED (was incorrect data)
export const mockUsers: MockUser[] = [
  // Data will be loaded from Supabase database
];

// Helper functions
export const getUserById = (id: string): MockUser | undefined => {
  console.log('🔍 getUserById:', { id, mockUsersLength: mockUsers.length });
  const user = mockUsers.find(user => user.id === id);
  console.log('🔍 getUserById result:', user?.name || 'NOT FOUND');
  return user;
};

export const getUsersByTeam = (teamId: string): MockUser[] => {
  return mockUsers.filter(user => user.team_id === teamId);
};

export const getUsersByLocation = (location: 'HN' | 'HCM'): MockUser[] => {
  const locationMap = { HN: 'Hà Nội', HCM: 'Hồ Chí Minh' };
  return mockUsers.filter(user => user.location === locationMap[location]);
};

export const getTeamsByLocation = (location: 'HN' | 'HCM'): MockTeam[] => {
  return mockTeams.filter(team => team.location === location);
};

export const isDirector = (userId: string): boolean => {
  const user = getUserById(userId) || getCurrentUser();
  const result = user?.role === 'retail_director';
  console.log('🔍 isDirector check:', {
    userId,
    user: user?.name,
    role: user?.role,
    isDirector: result,
  });
  return result;
};

export const isTeamLeader = (userId: string): boolean => {
  const user = getUserById(userId);
  return user?.role === 'team_leader';
};

// DEPRECATED: Use employeeService.getAllEmployees() instead
// This function is kept for backward compatibility but should not be used
export const getAllUsers = (): MockUser[] => {
  console.warn('getAllUsers() is deprecated. Use employeeService.getAllEmployees() instead.');
  return [];
};

// Export User type alias for compatibility
export type User = MockUser;

// Get current logged in user from auth context
export const getCurrentUser = (): MockUser => {
  // Get user from localStorage (set by AuthProvider when logging in)
  const savedUser = localStorage.getItem('auth_user');
  if (savedUser) {
    try {
      const authUser = JSON.parse(savedUser);

      // Debug logging
      console.log('🔍 getCurrentUser - authUser:', authUser);
      console.log('🔍 getCurrentUser - authUser.id:', authUser.id, 'Type:', typeof authUser.id);

      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(authUser.id)) {
        console.error('❌ Invalid UUID format for user ID:', authUser.id);
        // Try to get from currentUserId as fallback
        const fallbackId = localStorage.getItem('currentUserId');
        if (fallbackId && uuidRegex.test(fallbackId)) {
          console.log('✅ Using fallback UUID from currentUserId:', fallbackId);
          authUser.id = fallbackId;
        } else {
          throw new Error('Invalid user ID format');
        }
      }

      // Create a MockUser from auth data
      // The auth user already has all the necessary fields from the database
      const user = {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        team_id: authUser.team_id || 'director-team',
        location: authUser.location as 'Hà Nội' | 'Hồ Chí Minh',
        role: authUser.role as 'employee' | 'team_leader' | 'retail_director',
        team: authUser.team
          ? {
              id: authUser.team.id,
              name: authUser.team.name,
              location: (authUser.location === 'Hà Nội' ? 'HN' : 'HCM') as 'HN' | 'HCM',
            }
          : {
              id: 'director-team',
              name: 'Ban Giám Đốc',
              location: (authUser.location === 'Hà Nội' ? 'HN' : 'HCM') as 'HN' | 'HCM',
            },
      };

      console.log('🔍 getCurrentUser result:', user);
      return user;
    } catch (error) {
      console.error('Error parsing saved user:', error);
    }
  }

  // No logged in user - this should not happen in a protected route
  throw new Error('No authenticated user found');
};
