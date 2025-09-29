// Mock user data for testing task scope functionality
export interface MockUser {
  id: string;
  name: string;
  email: string;
  team_id: string;
  location: 'Hà Nội' | 'Hồ Chí Minh';
  role: 'employee' | 'team_leader' | 'retail_director';
  avatar?: string; // URL của avatar
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

  // Both KHỔNG ĐỨC MẠNH and NGUYỄN HẢI NINH are considered Directors
  const isDirectorByName = user?.name === 'Khổng Đức Mạnh' || user?.name === 'Nguyễn Hải Ninh';
  const isDirectorByRole = user?.role === 'retail_director';

  // Must have both correct name AND role
  const result = isDirectorByName && isDirectorByRole;

  console.log('🔍 isDirector check:', {
    userId,
    user: user?.name,
    role: user?.role,
    isDirectorByName,
    isDirectorByRole,
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
  try {
    // Get user from localStorage (set by AuthProvider when logging in)
    const savedUser = localStorage.getItem('auth_user');
    console.log('🔍 getCurrentUser - checking localStorage:', {
      hasAuthUser: !!savedUser,
      authUserLength: savedUser?.length || 0,
    });

    if (savedUser) {
      const authUser = JSON.parse(savedUser);
      console.log('🔍 getCurrentUser - parsed user:', {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        hasTeam: !!authUser.team,
      });

      // Validate that we have required fields
      if (!authUser.id || !authUser.name || !authUser.email) {
        console.error('❌ Missing required user fields:', authUser);
        throw new Error('Invalid user data');
      }

      // Create a MockUser from auth data
      const user: MockUser = {
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

      console.log('✅ getCurrentUser success:', user.name);
      return user;
    }

    // Try fallback methods
    console.log('🔍 getCurrentUser - trying fallback methods...');

    // Check currentUserId in localStorage
    const currentUserId = localStorage.getItem('currentUserId');
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const currentUserName = localStorage.getItem('currentUserName');

    if (currentUserId && currentUserEmail && currentUserName) {
      console.log('🔍 getCurrentUser - found fallback data:', {
        id: currentUserId,
        email: currentUserEmail,
        name: currentUserName,
      });

      // Create user from fallback data
      const fallbackUser: MockUser = {
        id: currentUserId,
        name: currentUserName,
        email: currentUserEmail,
        team_id: 'director-team',
        location: 'Hà Nội', // Default to Hà Nội
        role: 'employee',
        team: {
          id: 'director-team',
          name: 'Ban Giám Đốc',
          location: 'HN',
        },
      };

      console.log('✅ getCurrentUser fallback success:', fallbackUser.name);
      return fallbackUser;
    }
  } catch (error) {
    console.error('❌ Error in getCurrentUser:', error);
  }

  // No logged in user - this should not happen in a protected route
  console.error('❌ No authenticated user found in localStorage');
  console.error('❌ Available localStorage keys:', Object.keys(localStorage));
  throw new Error('No authenticated user found');
};
