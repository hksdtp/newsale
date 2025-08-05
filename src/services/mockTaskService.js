
// Temporary mock task service to bypass database issues
export class MockTaskService {
  constructor() {
    this.storageKey = 'mock_tasks';
  }

  async createTask(taskData, createdById) {
    const tasks = await this.getTasks();
    const currentUser = this.getCurrentUser();

    const newTask = {
      id: 'task-' + Date.now(),
      name: taskData.name,
      description: taskData.description || '',
      workType: Array.isArray(taskData.workTypes) ? taskData.workTypes[0] : 'other',
      priority: taskData.priority || 'normal',
      status: 'new-requests',
      campaignType: taskData.campaignType || '',
      platform: taskData.platform || [],
      startDate: taskData.startDate || new Date().toISOString().split('T')[0],
      endDate: taskData.endDate || null,
      dueDate: taskData.dueDate || null,
      department: taskData.department || 'HN',
      group: currentUser.team?.name || 'Unknown Team',
      shareScope: 'team',
      createdBy: {
        id: createdById,
        name: currentUser.name,
        email: currentUser.email,
        team_id: currentUser.team_id,
        location: currentUser.location
      },
      assignedTo: taskData.assignedToId ? {
        id: taskData.assignedToId,
        name: taskData.assignedToId === createdById ? currentUser.name : 'Assigned User',
        email: taskData.assignedToId === createdById ? currentUser.email : '',
        team_id: currentUser.team_id,
        location: currentUser.location
      } : null,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));

    console.log('✅ Task created in localStorage:', newTask);
    return newTask;
  }

  async getTasks() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  async updateTask(taskData) {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === taskData.id);
    if (index >= 0) {
      tasks[index] = { ...tasks[index], ...taskData };
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
      return tasks[index];
    }
    throw new Error('Task not found');
  }

  async deleteTask(taskId) {
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  getCurrentUser() {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }

    // Fallback
    return {
      id: localStorage.getItem('currentUserId') || 'unknown',
      name: localStorage.getItem('currentUserName') || 'Unknown User',
      email: localStorage.getItem('currentUserEmail') || 'unknown@email.com',
      team_id: 'unknown',
      location: 'Hà Nội',
      team: { name: 'Unknown Team' }
    };
  }
}

export const mockTaskService = new MockTaskService();
  