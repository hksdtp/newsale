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

// Mock teams data
export const mockTeams: MockTeam[] = [
  {
    id: '1',
    name: 'NHÓM 1 - Lương Việt Anh',
    location: 'HN',
    leader_id: '2'
  },
  {
    id: '2', 
    name: 'NHÓM 2 - Marketing HN',
    location: 'HN',
    leader_id: '4'
  },
  {
    id: '3',
    name: 'NHÓM 3 - Kinh doanh HCM', 
    location: 'HCM',
    leader_id: '6'
  },
  {
    id: '4',
    name: 'NHÓM 4 - Vận hành HCM',
    location: 'HCM', 
    leader_id: '9'
  }
];

// Mock users data
export const mockUsers: MockUser[] = [
  // Director (can see everything)
  {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'director@company.com',
    team_id: '0', // Director doesn't belong to a specific team
    location: 'Hà Nội',
    role: 'retail_director',
    team: {
      id: '0',
      name: 'Ban Giám Đốc',
      location: 'HN'
    }
  },
  
  // Team 1 - HN (Lương Việt Anh's team)
  {
    id: '2',
    name: 'Lương Việt Anh',
    email: 'anh.luong@company.com',
    team_id: '1',
    location: 'Hà Nội',
    role: 'team_leader',
    team: {
      id: '1',
      name: 'NHÓM 1 - Lương Việt Anh',
      location: 'HN'
    }
  },
  {
    id: '3',  
    name: 'Lê Khánh Duy',
    email: 'duy.le@company.com',
    team_id: '1',
    location: 'Hà Nội',
    role: 'employee',
    team: {
      id: '1',
      name: 'NHÓM 1 - Lương Việt Anh',
      location: 'HN'
    }
  },
  
  // Team 2 - HN  
  {
    id: '4',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@company.com',
    team_id: '2',
    location: 'Hà Nội',
    role: 'team_leader',
    team: {
      id: '2',
      name: 'NHÓM 2 - Marketing HN',
      location: 'HN'
    }
  },
  {
    id: '5',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@company.com', 
    team_id: '2',
    location: 'Hà Nội',
    role: 'employee',
    team: {
      id: '2',
      name: 'NHÓM 2 - Marketing HN',
      location: 'HN'
    }
  },
  
  // Team 3 - HCM
  {
    id: '6',
    name: 'Võ Thị Phương',
    email: 'phuong.vo@company.com',
    team_id: '3',
    location: 'Hồ Chí Minh',
    role: 'team_leader',
    team: {
      id: '3',
      name: 'NHÓM 3 - Kinh doanh HCM',
      location: 'HCM'
    }
  },
  {
    id: '7',
    name: 'Đặng Văn Giang',
    email: 'giang.dang@company.com',
    team_id: '3',
    location: 'Hồ Chí Minh',
    role: 'employee',
    team: {
      id: '3',
      name: 'NHÓM 3 - Kinh doanh HCM',
      location: 'HCM'
    }
  },
  {
    id: '8',
    name: 'Bùi Thị Hoa',
    email: 'hoa.bui@company.com',
    team_id: '3',
    location: 'Hồ Chí Minh',
    role: 'employee',
    team: {
      id: '3',
      name: 'NHÓM 3 - Kinh doanh HCM', 
      location: 'HCM'
    }
  },
  
  // Team 4 - HCM
  {
    id: '9',
    name: 'Ngô Văn Ích',
    email: 'ich.ngo@company.com',
    team_id: '4',
    location: 'Hồ Chí Minh',
    role: 'team_leader',
    team: {
      id: '4',
      name: 'NHÓM 4 - Vận hành HCM',
      location: 'HCM'
    }
  },
  {
    id: '10',
    name: 'Lý Thị Kim',
    email: 'kim.ly@company.com',
    team_id: '4',
    location: 'Hồ Chí Minh',
    role: 'employee',
    team: {
      id: '4',
      name: 'NHÓM 4 - Vận hành HCM',
      location: 'HCM'
    }
  }
];

// Helper functions
export const getUserById = (id: string): MockUser | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUsersByTeam = (teamId: string): MockUser[] => {
  return mockUsers.filter(user => user.team_id === teamId);
};

export const getUsersByLocation = (location: 'HN' | 'HCM'): MockUser[] => {
  const locationMap = { 'HN': 'Hà Nội', 'HCM': 'Hồ Chí Minh' };
  return mockUsers.filter(user => user.location === locationMap[location]);
};

export const getTeamsByLocation = (location: 'HN' | 'HCM'): MockTeam[] => {
  return mockTeams.filter(team => team.location === location);
};

export const isDirector = (userId: string): boolean => {
  const user = getUserById(userId);
  return user?.role === 'retail_director';
};

export const isTeamLeader = (userId: string): boolean => {
  const user = getUserById(userId);
  return user?.role === 'team_leader';
};

// Get current logged in user from auth context
export const getCurrentUser = (): MockUser => {
  // Get user from localStorage (set by AuthProvider when logging in)
  const savedUser = localStorage.getItem('auth_user');
  if (savedUser) {
    try {
      const authUser = JSON.parse(savedUser);
      
      // Create a MockUser from auth data
      // The auth user already has all the necessary fields from the database
      return {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        team_id: authUser.team_id || '0',
        location: authUser.location as 'Hà Nội' | 'Hồ Chí Minh',
        role: authUser.role as 'employee' | 'team_leader' | 'retail_director',
        team: authUser.team ? {
          id: authUser.team.id,
          name: authUser.team.name,
          location: authUser.location === 'Hà Nội' ? 'HN' : 'HCM'
        } : {
          id: '0',
          name: 'Ban Giám Đốc',
          location: authUser.location === 'Hà Nội' ? 'HN' : 'HCM'
        }
      };
    } catch (error) {
      console.error('Error parsing saved user:', error);
    }
  }
  
  // No logged in user - this should not happen in a protected route
  throw new Error('No authenticated user found');
};
