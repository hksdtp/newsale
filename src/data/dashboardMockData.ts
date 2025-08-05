// Mock data cho Dashboard - sẽ được thay thế bằng dữ liệu từ Excel sau này
export const dashboardMockData = {
  // Phần 1: Thống kê theo vai trò quản lý (KHỔNG ĐỨC MẠNH)
  managerStats: {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0.0,
    hanoiRevenue: 0, // 0 VNĐ
    hcmRevenue: 0,   // 0 VNĐ
  },

  // Phần 2: Thống kê cá nhân (theo người dùng hiện tại)
  personalStats: {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0.0,
    personalRevenue: 0, // 0 VNĐ
  },

  // Phần 3: Thống kê team
  teamStats: {
    totalMembers: 12, // Giữ nguyên số nhân viên thực tế
    activeMembers: 12,
    teamEfficiency: 0.0
  },

  // Phần 4: Thống kê tổng quan theo danh mục
  categoryStats: {
    architects: {
      new: 0,
      existing: 0,
      total: 0
    },
    partners: {
      new: 0,
      existing: 0,
      total: 0
    },
    customers: {
      new: 0,
      existing: 0,
      total: 0
    },
    quotes: {
      new: 0,
      existing: 0,
      total: 0
    },
    otherTasks: 0
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
  createdAt?: string;
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
        startDate: '2023-09-10',
        endDate: '2023-09-30',
        createdAt: '2023-09-10',
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
        startDate: '2023-10-15',
        endDate: '2023-10-30',
        createdBy: 'Lê Văn C',
        status: 'approved',
        assignedTo: 'Khổng Đức Mạnh',
        group: 'Nhóm Content HN',
        department: 'HN',
        workType: 'kts-new',
        description: 'Tổ chức workshop về thiết kế bền vững cho kiến trúc sư mới, nâng cao nhận thức về kiến trúc xanh',
        priority: 'normal',
        dueDate: '2023-10-30',
        createdAt: '2023-10-15'
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
        startDate: '2023-09-02',
        endDate: '2023-09-20',
        createdBy: 'Hoàng Văn E',
        status: 'live',
        assignedTo: 'Vũ Thị F',
        group: 'Nhóm Digital HCM',
        department: 'HCM',
        workType: 'partner-old',
        description: 'Tự động hóa quy trình làm việc với đối tác hiện tại',
        priority: 'high',
        dueDate: '2023-09-20',
        createdAt: '2023-09-02'
      },
      {
        id: 'task-4',
        name: 'Trò chơi tương tác',
        campaignType: 'Nhận diện thương hiệu',
        platform: ['TikTok', 'Instagram'],
        startDate: '2023-09-06',
        endDate: '2023-09-23',
        createdAt: '2023-09-06',
        createdBy: 'Đỗ Văn G',
        status: 'live',
        assignedTo: 'Bùi Thị H',
        group: 'Nhóm Social HCM',
        department: 'HCM',
        workType: 'kts-old',
        description: 'Tạo trò chơi tương tác cho kiến trúc sư hiện tại',
        priority: 'normal',
        dueDate: '2023-09-23'
      },
      {
        id: 'task-5',
        name: 'Hợp tác sâu rộng',
        campaignType: 'Tạo khách hàng tiềm năng',
        platform: ['Google ads'],
        startDate: '2023-09-12',
        endDate: '2023-09-30',
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
    status: 'live',
    isExpanded: true,
    tasks: [
      {
        id: 'task-6',
        name: 'Tái nhắm mục tiêu khách hàng tiềm năng',
        campaignType: 'Tái nhắm mục tiêu',
        platform: ['LinkedIn', 'Email'],
        startDate: '2023-10-31',
        endDate: '2023-11-12',
        createdBy: 'Trịnh Văn K',
        status: 'live',
        assignedTo: 'Khổng Đức Mạnh',
        group: 'Nhóm CRM HN',
        department: 'HN',
        workType: 'partner-new',
        description: 'Phát triển đối tác mới thông qua tái nhắm mục tiêu',
        priority: 'low',
        dueDate: '2023-11-12',
        createdAt: '2023-10-31'
      }
    ]
  },
  {
    id: 'done',
    name: 'Hoàn thành',
    status: 'live',
    isExpanded: false,
    tasks: [
      {
        id: 'task-7',
        name: 'Tối ưu hóa chiến dịch Email',
        campaignType: 'Email marketing',
        platform: ['Email'],
        startDate: '2023-08-15',
        endDate: '2023-09-01',
        createdBy: 'Phan Văn M',
        status: 'live',
        assignedTo: 'Võ Thị N',
        group: 'Nhóm Email HCM',
        department: 'HCM',
        workType: 'other',
        description: 'Tối ưu hóa hiệu quả chiến dịch email marketing',
        priority: 'normal',
        dueDate: '2023-09-01',
        createdAt: '2023-08-15'
      }
    ]
  }
];
