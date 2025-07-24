export const testTasks = [
  {
    id: 'test-task-1',
    name: 'Test Task 1',
    description: 'This is a test task for automation',
    workTypes: ['sbg-new'],
    priority: 'high',
    status: 'new-requests',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    department: 'HN',
    shareScope: 'team'
  },
  {
    id: 'test-task-2', 
    name: 'Test Task 2',
    description: 'Another test task with different settings',
    workTypes: ['partner-new', 'kts-old'],
    priority: 'normal',
    status: 'approved',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    department: 'HCM',
    shareScope: 'public'
  }
];

export const testUsers = {
  admin: {
    email: 'admin@company.com',
    password: '123456',
    name: 'Admin User'
  },
  user1: {
    email: 'user1@company.com', 
    password: '123456',
    name: 'Test User 1'
  }
};

export const testTeams = [
  {
    id: '1',
    name: 'NHÓM 1',
    location: 'HN',
    members: ['user1@company.com']
  },
  {
    id: '2', 
    name: 'NHÓM 2',
    location: 'HCM',
    members: ['admin@company.com']
  }
];
