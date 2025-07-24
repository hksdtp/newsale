// Mock data cho Dashboard - sẽ được thay thế bằng dữ liệu từ Excel sau này
export const dashboardMockData = {
  // Phần 1: Thống kê theo vai trò quản lý (KHỔNG ĐỨC MẠNH)
  managerStats: {
    totalTasks: 156,
    completedTasks: 142,
    completionRate: 91.0,
    hanoiRevenue: 2850000000, // 2.85 tỷ VNĐ
    hcmRevenue: 3200000000,   // 3.2 tỷ VNĐ
  },

  // Phần 2: Thống kê cá nhân (theo người dùng hiện tại)
  personalStats: {
    totalTasks: 28,
    completedTasks: 25,
    completionRate: 89.3,
    personalRevenue: 450000000, // 450 triệu VNĐ
  },

  // Phần 3: Thống kê team
  teamStats: {
    totalMembers: 24,
    activeMembers: 22,
    teamEfficiency: 87.5
  },

  // Phần 4: Thống kê tổng quan theo danh mục
  categoryStats: {
    architects: {
      new: 12,
      existing: 45,
      total: 57
    },
    partners: {
      new: 8,
      existing: 23,
      total: 31
    },
    customers: {
      new: 34,
      existing: 128,
      total: 162
    },
    quotes: {
      new: 18,
      existing: 67,
      total: 85
    },
    otherTasks: 24
  }
};

// Utility function để format tiền tệ VNĐ
export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ VNĐ`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} triệu VNĐ`;
  } else {
    return `${amount.toLocaleString('vi-VN')} VNĐ`;
  }
};

// Utility function để format phần trăm
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Constants cho loại công việc
export const WORK_TYPES = {
  'other': 'Công việc khác',
  'sbg-new': 'SBG mới',
  'sbg-old': 'SBG cũ',
  'partner-new': 'Đối tác mới',
  'partner-old': 'Đối tác cũ',
  'kts-new': 'KTS mới',
  'kts-old': 'KTS cũ',
  'customer-new': 'Khách hàng mới',
  'customer-old': 'Khách hàng cũ'
} as const;

export type WorkType = keyof typeof WORK_TYPES;

// Mock data cho công việc
export interface Task {
  id: string;
  name: string;
  campaignType: string;
  platform: string[];
  startDate: string;
  endDate: string;
  createdBy: string;
  status: 'new-requests' | 'approved' | 'live';
  assignedTo?: string;
  group?: string;
  department?: 'HN' | 'HCM';
  workType: WorkType;
  description?: string;
  priority: 'low' | 'normal' | 'high';
  dueDate?: string;
}

export interface TaskGroup {
  id: string;
  name: string;
  status: 'new-requests' | 'approved' | 'live';
  tasks: Task[];
  isExpanded: boolean;
}

export const tasksMockData: TaskGroup[] = [
  {
    id: 'new-requests',
    name: 'Yêu cầu mới',
    status: 'new-requests',
    isExpanded: true,
    tasks: [
      {
        id: 'task-1',
        name: 'Phát triển chiến lược marketing cho Q4',
        campaignType: 'Marketing nội dung',
        platform: ['Google ads', 'LinkedIn'],
        startDate: '10 Th9, 2023',
        endDate: '30 Th9, 2023',
        createdBy: 'Nguyễn Văn A',
        status: 'new-requests',
        assignedTo: 'Khổng Đức Mạnh',
        group: 'Nhóm Marketing HN',
        department: 'HN',
        workType: 'sbg-new',
        description: 'Phát triển chiến lược nhắm mục tiêu cho sàn bất động sản mới trong quý 4, tập trung vào phân khúc khách hàng trẻ',
        priority: 'high',
        dueDate: '30 Th9, 2023'
      }
    ]
  },
  {
    id: 'approved',
    name: 'Đã phê duyệt',
    status: 'approved',
    isExpanded: true,
    tasks: [
      {
        id: 'task-2',
        name: 'Tổ chức workshop thiết kế xanh',
        campaignType: 'Lãnh đạo tư tưởng',
        platform: ['LinkedIn', 'Twitter'],
        startDate: '15 Th10, 2023',
        endDate: '30 Th10, 2023',
        createdBy: 'Lê Văn C',
        status: 'approved',
        assignedTo: 'Khổng Đức Mạnh',
        group: 'Nhóm Content HN',
        department: 'HN',
        workType: 'kts-new',
        description: 'Tổ chức workshop về thiết kế bền vững cho kiến trúc sư mới, nâng cao nhận thức về kiến trúc xanh',
        priority: 'normal',
        dueDate: '30 Th10, 2023'
      }
    ]
  },
  {
    id: 'live',
    name: 'Đang triển khai',
    status: 'live',
    isExpanded: true,
    tasks: [
      {
        id: 'task-3',
        name: 'Tự động hóa quy trình',
        campaignType: 'Ra mắt sản phẩm',
        platform: ['Twitter', 'LinkedIn'],
        startDate: '2 Th9, 2023',
        endDate: '20 Th9, 2023',
        createdBy: 'Hoàng Văn E',
        status: 'live',
        assignedTo: 'Vũ Thị F',
        group: 'Nhóm Digital HCM',
        department: 'HCM',
        workType: 'partner-old',
        description: 'Tự động hóa quy trình làm việc với đối tác hiện tại',
        priority: 'high',
        dueDate: '20 Th9, 2023'
      },
      {
        id: 'task-4',
        name: 'Trò chơi tương tác',
        campaignType: 'Nhận diện thương hiệu',
        platform: ['TikTok', 'Instagram'],
        startDate: '6 Th9, 2023',
        endDate: '23 Th9, 2023',
        createdBy: 'Đỗ Văn G',
        status: 'live',
        assignedTo: 'Bùi Thị H',
        group: 'Nhóm Social HCM',
        department: 'HCM',
        workType: 'kts-old',
        description: 'Tạo trò chơi tương tác cho kiến trúc sư hiện tại',
        priority: 'normal',
        dueDate: '23 Th9, 2023'
      },
      {
        id: 'task-5',
        name: 'Hợp tác sâu rộng',
        campaignType: 'Tạo khách hàng tiềm năng',
        platform: ['Google ads'],
        startDate: '12 Th9, 2023',
        endDate: '30 Th9, 2023',
        createdBy: 'Ngô Văn I',
        status: 'live',
        assignedTo: 'Khổng Đức Mạnh',
        group: 'Nhóm Performance HN',
        department: 'HN',
        workType: 'customer-old',
        description: 'Mở rộng hợp tác với khách hàng hiện tại',
        priority: 'normal',
        dueDate: '30 Th9, 2023'
      }
    ]
  },
  {
    id: 'wont-do',
    name: "Không thực hiện",
    status: 'wont-do',
    isExpanded: true,
    tasks: [
      {
        id: 'task-6',
        name: 'Tái nhắm mục tiêu khách hàng tiềm năng',
        campaignType: 'Tái nhắm mục tiêu',
        platform: ['LinkedIn', 'Email'],
        startDate: '31 Th10, 2023',
        endDate: '12 Th11, 2023',
        createdBy: 'Trịnh Văn K',
        status: 'wont-do',
        assignedTo: 'Khổng Đức Mạnh',
        group: 'Nhóm CRM HN',
        department: 'HN',
        workType: 'partner-new',
        description: 'Phát triển đối tác mới thông qua tái nhắm mục tiêu',
        priority: 'low',
        dueDate: '12 Th11, 2023'
      }
    ]
  },
  {
    id: 'done',
    name: 'Hoàn thành',
    status: 'done',
    isExpanded: false,
    tasks: [
      {
        id: 'task-7',
        name: 'Tối ưu hóa chiến dịch Email',
        campaignType: 'Email marketing',
        platform: ['Email'],
        startDate: '15 Th8, 2023',
        endDate: '1 Th9, 2023',
        createdBy: 'Phan Văn M',
        status: 'done',
        assignedTo: 'Võ Thị N',
        group: 'Nhóm Email HCM',
        department: 'HCM',
        workType: 'other',
        description: 'Tối ưu hóa hiệu quả chiến dịch email marketing',
        priority: 'normal',
        dueDate: '1 Th9, 2023'
      }
    ]
  }
];
