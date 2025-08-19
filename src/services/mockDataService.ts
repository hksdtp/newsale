/**
 * 🎭 MOCK DATA SERVICE
 * Cung cấp dữ liệu giả lập khi Supabase không khả dụng
 */

import { TaskWithUsers } from './taskService';
import { WorkType } from '../data/dashboardMockData';

// Mock tasks data
const mockTasks: TaskWithUsers[] = [
  {
    id: '1',
    name: 'Thiết kế giao diện trang chủ',
    description: 'Tạo mockup và prototype cho trang chủ website mới',
    workType: 'sbg-new',
    workTypes: ['sbg-new'],
    priority: 'high',
    status: 'new-requests',
    startDate: '2025-08-18',
    endDate: '2025-08-25',
    dueDate: '2025-08-25',
    campaignType: 'Website',
    platform: ['Web'],
    department: 'HN',
    shareScope: 'team',
    source: 'manual',
    createdAt: '2025-08-18T00:00:00Z',
    createdBy: {
      id: 'user1',
      name: 'Nguyễn Văn A',
      email: 'nguyen@company.com',
      team_id: 'team1',
      location: 'Hà Nội Office'
    },
    assignedTo: {
      id: 'user2',
      name: 'Trần Thị B',
      email: 'tran@company.com',
      team_id: 'team1',
      location: 'Hà Nội Office'
    }
  },
  {
    id: '2',
    name: 'Phát triển API backend',
    description: 'Xây dựng REST API cho hệ thống quản lý task',
    workType: 'partner-new',
    workTypes: ['partner-new'],
    priority: 'normal',
    status: 'approved',
    startDate: '2025-08-17',
    endDate: '2025-08-30',
    dueDate: '2025-08-30',
    campaignType: 'Development',
    platform: ['API'],
    department: 'HCM',
    shareScope: 'public',
    source: 'manual',
    createdAt: '2025-08-17T00:00:00Z',
    createdBy: {
      id: 'user3',
      name: 'Lê Văn C',
      email: 'le@company.com',
      team_id: 'team1',
      location: 'TP.HCM Office'
    },
    assignedTo: {
      id: 'user4',
      name: 'Phạm Văn D',
      email: 'pham@company.com',
      team_id: 'team1',
      location: 'TP.HCM Office'
    }
  },
  {
    id: '3',
    name: 'Testing và QA',
    description: 'Kiểm tra chất lượng và tìm lỗi trong hệ thống',
    workType: 'kts-new',
    workTypes: ['kts-new'],
    priority: 'low',
    status: 'live',
    startDate: '2025-08-15',
    endDate: '2025-08-20',
    dueDate: '2025-08-20',
    campaignType: 'Quality Assurance',
    platform: ['Web', 'Mobile'],
    department: 'HN',
    shareScope: 'team',
    source: 'manual',
    createdAt: '2025-08-15T00:00:00Z',
    createdBy: {
      id: 'user5',
      name: 'Hoàng Thị E',
      email: 'hoang@company.com',
      team_id: 'team1',
      location: 'Remote'
    },
    assignedTo: {
      id: 'user6',
      name: 'Vũ Văn F',
      email: 'vu@company.com',
      team_id: 'team1',
      location: 'Remote'
    }
  }
];

// Mock stats data
const mockStats = {
  personal: {
    totalTasks: 15,
    completedTasks: 8,
    pendingTasks: 5,
    overdueTasks: 2,
    workTypeDistribution: {
      'sbg-new': 5,
      'partner-new': 4,
      'kts-new': 3,
      'customer-new': 2,
      'other': 1
    }
  },
  team: {
    totalTasks: 45,
    completedTasks: 25,
    pendingTasks: 15,
    overdueTasks: 5
  }
};

export class MockDataService {
  private static instance: MockDataService;
  private tasks: TaskWithUsers[] = [...mockTasks];

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  // Mock task operations
  async getTasks(filters?: any): Promise<TaskWithUsers[]> {
    console.log('🎭 Mock: Getting tasks with filters:', filters);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredTasks = [...this.tasks];
    
    // Apply filters if provided
    if (filters?.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }
    
    if (filters?.department) {
      filteredTasks = filteredTasks.filter(task => task.department === filters.department);
    }
    
    if (filters?.assignedToId) {
      filteredTasks = filteredTasks.filter(task => task.assignedTo?.id === filters.assignedToId);
    }
    
    return filteredTasks;
  }

  async createTask(taskData: any): Promise<TaskWithUsers> {
    console.log('🎭 Mock: Creating task:', taskData);
    
    const newTask: TaskWithUsers = {
      id: `mock-${Date.now()}`,
      name: taskData.name,
      description: taskData.description,
      workType: taskData.workTypes?.[0] || 'other',
      workTypes: taskData.workTypes || ['other'],
      priority: taskData.priority,
      status: 'new-requests',
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      dueDate: taskData.dueDate,
      campaignType: taskData.campaignType,
      platform: taskData.platform,
      department: taskData.department,
      shareScope: taskData.shareScope || 'team',
      source: 'manual',
      createdAt: new Date().toISOString(),
      createdBy: {
        id: 'current-user',
        name: 'Current User',
        email: 'current@company.com',
        team_id: 'team1',
        location: 'Hà Nội Office'
      },
      assignedTo: {
        id: taskData.assignedToId || 'current-user',
        name: 'Assigned User',
        email: 'assigned@company.com',
        team_id: 'team1',
        location: 'Hà Nội Office'
      }
    };
    
    this.tasks.unshift(newTask);
    return newTask;
  }

  async updateTask(taskId: string, updates: any): Promise<TaskWithUsers | null> {
    console.log('🎭 Mock: Updating task:', taskId, updates);
    
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return null;
    
    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    return this.tasks[taskIndex];
  }

  async deleteTask(taskId: string): Promise<boolean> {
    console.log('🎭 Mock: Deleting task:', taskId);
    
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return false;
    
    this.tasks.splice(taskIndex, 1);
    return true;
  }

  // Mock stats operations
  async getPersonalStats(userId: string): Promise<any> {
    console.log('🎭 Mock: Getting personal stats for user:', userId);
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockStats.personal;
  }

  async getTeamStats(teamId: string): Promise<any> {
    console.log('🎭 Mock: Getting team stats for team:', teamId);
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockStats.team;
  }

  // Mock auto-move operations
  async getScheduledTasks(): Promise<TaskWithUsers[]> {
    console.log('🎭 Mock: Getting scheduled tasks');
    return this.tasks.filter(task => task.source === 'scheduled');
  }

  async getOverdueTasks(): Promise<TaskWithUsers[]> {
    console.log('🎭 Mock: Getting overdue tasks');
    const today = new Date().toISOString().split('T')[0];
    return this.tasks.filter(task => 
      task.dueDate && task.dueDate < today && task.status !== 'live'
    );
  }
}

export const mockDataService = MockDataService.getInstance();
