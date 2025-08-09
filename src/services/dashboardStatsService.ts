import { getCurrentUser } from '../data/usersMockData';
import { supabase } from '../shared/api/supabase';
import { teamsService } from './teamsService';

export interface CategoryStats {
  ktsNew: number;
  ktsOld: number;
  partnerNew: number;
  partnerOld: number;
  customerNew: number;
  customerOld: number;
  sbgNew: number;
  sbgOld: number;
  other: number;
}

export interface DashboardStats {
  personal: CategoryStats;
  team?: CategoryStats;
  department?: CategoryStats;
  // For Khổng Đức Mạnh - location-based stats
  hanoi?: CategoryStats;
  hcm?: CategoryStats;
  // For team leaders and directors - individual team member stats
  teamMembers?: Array<{
    userId: string;
    userName: string;
    stats: CategoryStats;
  }>;
}

export interface TimeFilter {
  period: 'today' | 'week' | 'month' | 'all';
  startDate?: string;
  endDate?: string;
}

/**
 * Mapping từ work_type trong database sang category stats
 */
const WORK_TYPE_MAPPING: Record<string, keyof CategoryStats> = {
  'kts-new': 'ktsNew',
  'kts-old': 'ktsOld',
  'partner-new': 'partnerNew',
  'partner-old': 'partnerOld',
  'customer-new': 'customerNew',
  'customer-old': 'customerOld',
  'sbg-new': 'sbgNew',
  'sbg-old': 'sbgOld',
  other: 'other',
};

/**
 * Tạo filter thời gian cho query
 */
function createTimeFilter(timeFilter: TimeFilter): { startDate: string; endDate: string } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (timeFilter.period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'all':
    default:
      startDate = new Date(2020, 0, 1); // Từ 2020
      break;
  }

  if (timeFilter.startDate && timeFilter.endDate) {
    startDate = new Date(timeFilter.startDate);
    endDate = new Date(timeFilter.endDate);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Lấy thống kê cá nhân của user hiện tại
 */
export async function getPersonalStats(
  userId: string,
  timeFilter: TimeFilter = { period: 'all' }
): Promise<CategoryStats> {
  try {
    const { startDate, endDate } = createTimeFilter(timeFilter);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('work_type')
      .eq('created_by_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('❌ Error fetching personal stats:', error);
      return createEmptyStats();
    }

    return calculateCategoryStats(tasks || []);
  } catch (error) {
    console.error('❌ Error in getPersonalStats:', error);
    return createEmptyStats();
  }
}

/**
 * Lấy thống kê nhóm (cho trưởng nhóm)
 */
export async function getTeamStats(
  teamId: string,
  timeFilter: TimeFilter = { period: 'all' }
): Promise<CategoryStats> {
  try {
    const { startDate, endDate } = createTimeFilter(timeFilter);

    // Lấy danh sách user trong team
    const { data: teamMembers, error: teamError } = await supabase
      .from('users')
      .select('id')
      .eq('team_id', teamId);

    if (teamError) {
      console.error('❌ Error fetching team members:', teamError);
      return createEmptyStats();
    }

    if (!teamMembers || teamMembers.length === 0) {
      return createEmptyStats();
    }

    const memberIds = teamMembers.map(member => member.id);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('work_type')
      .in('created_by_id', memberIds)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('❌ Error fetching team stats:', error);
      return createEmptyStats();
    }

    return calculateCategoryStats(tasks || []);
  } catch (error) {
    console.error('❌ Error in getTeamStats:', error);
    return createEmptyStats();
  }
}

/**
 * Lấy thống kê toàn phòng (cho Khổng Đức Mạnh)
 */
export async function getDepartmentStats(
  timeFilter: TimeFilter = { period: 'all' }
): Promise<CategoryStats> {
  try {
    const { startDate, endDate } = createTimeFilter(timeFilter);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('work_type')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('❌ Error fetching department stats:', error);
      return createEmptyStats();
    }

    return calculateCategoryStats(tasks || []);
  } catch (error) {
    console.error('❌ Error in getDepartmentStats:', error);
    return createEmptyStats();
  }
}

/**
 * Lấy thống kê theo location (Hà Nội/HCM)
 */
export async function getLocationStats(
  location: 'Hà Nội' | 'Hồ Chí Minh',
  timeFilter: TimeFilter = { period: 'all' }
): Promise<CategoryStats> {
  try {
    const { startDate, endDate } = createTimeFilter(timeFilter);

    // Lấy danh sách user theo location
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('location', location);

    if (usersError) {
      console.error('❌ Error fetching users by location:', usersError);
      return createEmptyStats();
    }

    if (!users || users.length === 0) {
      return createEmptyStats();
    }

    const userIds = users.map(user => user.id);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('work_type')
      .in('created_by_id', userIds)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('❌ Error fetching location stats:', error);
      return createEmptyStats();
    }

    return calculateCategoryStats(tasks || []);
  } catch (error) {
    console.error('❌ Error in getLocationStats:', error);
    return createEmptyStats();
  }
}

/**
 * Lấy thống kê của các thành viên trong team
 */
export async function getTeamMembersStats(
  teamId: string,
  timeFilter: TimeFilter = { period: 'all' }
): Promise<Array<{ userId: string; userName: string; stats: CategoryStats }>> {
  try {
    const members = await teamsService.getTeamMembers(teamId);

    if (!members || members.length === 0) {
      return [];
    }

    const memberStats = await Promise.all(
      members.map(async member => {
        const stats = await getPersonalStats(member.id, timeFilter);
        return {
          userId: member.id,
          userName: member.name,
          stats,
        };
      })
    );

    return memberStats;
  } catch (error) {
    console.error('❌ Error in getTeamMembersStats:', error);
    return [];
  }
}

/**
 * Tính toán thống kê từ danh sách tasks
 */
function calculateCategoryStats(tasks: Array<{ work_type: string }>): CategoryStats {
  const stats = createEmptyStats();

  tasks.forEach(task => {
    const categoryKey = WORK_TYPE_MAPPING[task.work_type];
    if (categoryKey) {
      stats[categoryKey]++;
    }
  });

  return stats;
}

/**
 * Tạo object stats rỗng
 */
function createEmptyStats(): CategoryStats {
  return {
    ktsNew: 0,
    ktsOld: 0,
    partnerNew: 0,
    partnerOld: 0,
    customerNew: 0,
    customerOld: 0,
    sbgNew: 0,
    sbgOld: 0,
    other: 0,
  };
}

/**
 * Lấy dashboard stats dựa trên role của user
 */
export async function getDashboardStats(
  timeFilter: TimeFilter = { period: 'all' }
): Promise<DashboardStats> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return { personal: createEmptyStats() };
  }

  const personalStats = await getPersonalStats(currentUser.id, timeFilter);

  // Khổng Đức Mạnh - chỉ xem theo khu vực (Hà Nội/HCM) với team selector
  if (currentUser.name === 'Khổng Đức Mạnh' || currentUser.role === 'retail_director') {
    const [hanoiStats, hcmStats] = await Promise.all([
      getLocationStats('Hà Nội', timeFilter),
      getLocationStats('Hồ Chí Minh', timeFilter),
    ]);

    return {
      personal: personalStats,
      hanoi: hanoiStats,
      hcm: hcmStats,
    };
  }

  // Trưởng nhóm - xem được nhóm và thành viên
  if (currentUser.role === 'team_leader' && currentUser.team_id) {
    const [teamStats, teamMembersStats] = await Promise.all([
      getTeamStats(currentUser.team_id, timeFilter),
      getTeamMembersStats(currentUser.team_id, timeFilter),
    ]);

    return {
      personal: personalStats,
      team: teamStats,
      teamMembers: teamMembersStats,
    };
  }

  // Nhân viên - chỉ xem cá nhân
  return {
    personal: personalStats,
  };
}

/**
 * Lấy thống kê của một user cụ thể (cho trưởng nhóm/director xem)
 */
export async function getUserStats(
  userId: string,
  timeFilter: TimeFilter = { period: 'all' }
): Promise<CategoryStats> {
  return getPersonalStats(userId, timeFilter);
}
