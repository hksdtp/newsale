import { getCurrentUser } from '../data/usersMockData';

export type UserRole = 'employee' | 'team_leader' | 'retail_director';
export type TaskScope = 'my-tasks' | 'team-tasks' | 'department-tasks';

export interface RolePermissions {
  canViewAllTeams: boolean;
  canViewCrossLocation: boolean;
  canCreateTasks: boolean;
  canEditAllTasks: boolean;
  canDeleteAllTasks: boolean;
  allowedTaskScopes: TaskScope[];
  defaultLocation: 'HN' | 'HCM';
}

/**
 * Get user role permissions based on their role
 */
export const getRolePermissions = (role: UserRole, location: string): RolePermissions => {
  const defaultLocation = location === 'Hà Nội' ? 'HN' : 'HCM';

  switch (role) {
    case 'retail_director':
      return {
        canViewAllTeams: true,
        canViewCrossLocation: true,
        canCreateTasks: true,
        canEditAllTasks: true,
        canDeleteAllTasks: true,
        allowedTaskScopes: ['my-tasks', 'team-tasks', 'department-tasks'],
        defaultLocation
      };

    case 'team_leader':
      return {
        canViewAllTeams: false, // 🔒 SECURITY: Only their own team
        canViewCrossLocation: false, // 🔒 SECURITY: Only their location
        canCreateTasks: true,
        canEditAllTasks: false, // 🔒 SECURITY: Only their team's tasks
        canDeleteAllTasks: false, // 🔒 SECURITY: Only their team's tasks
        allowedTaskScopes: ['my-tasks', 'team-tasks', 'department-tasks'],
        defaultLocation
      };

    case 'employee':
      return {
        canViewAllTeams: false, // Only their own team
        canViewCrossLocation: false, // Only their location
        canCreateTasks: true,
        canEditAllTasks: false, // Only their own tasks
        canDeleteAllTasks: false, // Only their own tasks
        allowedTaskScopes: ['my-tasks', 'team-tasks', 'department-tasks'],
        defaultLocation
      };

    default:
      return {
        canViewAllTeams: false,
        canViewCrossLocation: false,
        canCreateTasks: false,
        canEditAllTasks: false,
        canDeleteAllTasks: false,
        allowedTaskScopes: ['my-tasks'],
        defaultLocation
      };
  }
};

/**
 * Get current user's permissions
 */
export const getCurrentUserPermissions = (): RolePermissions => {
  try {
    // Get user from localStorage since getCurrentUser might not work in all contexts
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const currentUser = JSON.parse(savedUser);
      return getRolePermissions(currentUser.role, currentUser.location);
    }

    // Fallback to getCurrentUser
    const currentUser = getCurrentUser();
    return getRolePermissions(currentUser.role, currentUser.location);
  } catch (error) {
    console.error('Error getting current user permissions:', error);
    return getRolePermissions('employee', 'Hà Nội');
  }
};

/**
 * 🔒 SECURITY: Check if user can view tasks from a specific team
 * FIXED: Team leaders can ONLY view their own team's tasks, not other teams
 */
export const canViewTeamTasks = (userTeamId: string, targetTeamId: string, userRole: UserRole): boolean => {
  if (userRole === 'retail_director') {
    return true; // Directors can view all teams
  }

  // 🔒 SECURITY FIX: Team leaders and employees can ONLY view their own team
  return userTeamId === targetTeamId;
};

/**
 * Check if user can view tasks from a specific location
 */
export const canViewLocationTasks = (userLocation: string, targetLocation: string, userRole: UserRole): boolean => {
  if (userRole === 'retail_director') {
    return true; // Directors can view all locations
  }
  
  const userLoc = userLocation === 'Hà Nội' ? 'HN' : 'HCM';
  return userLoc === targetLocation; // Others can only view their own location
};

/**
 * Check if user can edit a specific task
 */
export const canEditTask = (task: any, currentUser: any): boolean => {
  const permissions = getRolePermissions(currentUser.role, currentUser.location);
  
  if (permissions.canEditAllTasks) {
    return true; // Directors can edit all tasks
  }
  
  // Team leaders can edit tasks from their team
  if (currentUser.role === 'team_leader') {
    return task.createdBy?.team_id === currentUser.team_id || 
           task.assignedTo?.team_id === currentUser.team_id;
  }
  
  // Employees can only edit their own tasks
  return task.createdBy?.id === currentUser.id || task.assignedTo?.id === currentUser.id;
};

/**
 * Check if user can delete a specific task
 */
export const canDeleteTask = (task: any, currentUser: any): boolean => {
  const permissions = getRolePermissions(currentUser.role, currentUser.location);
  
  if (permissions.canDeleteAllTasks) {
    return true; // Directors can delete all tasks
  }
  
  // Team leaders can delete tasks from their team
  if (currentUser.role === 'team_leader') {
    return task.createdBy?.team_id === currentUser.team_id || 
           task.assignedTo?.team_id === currentUser.team_id;
  }
  
  // Employees can only delete their own tasks
  return task.createdBy?.id === currentUser.id;
};

/**
 * Get available team filter options based on user role
 */
export const getAvailableTeamFilters = (teams: any[], currentUser: any): any[] => {
  const permissions = getRolePermissions(currentUser.role, currentUser.location);
  
  if (permissions.canViewAllTeams) {
    // Directors can see all teams in their location or all locations
    if (permissions.canViewCrossLocation) {
      return teams; // All teams
    } else {
      const userLocation = currentUser.location === 'Hà Nội' ? 'HN' : 'HCM';
      return teams.filter(team => team.location === userLocation);
    }
  }
  
  // Team leaders and employees can only see their own team
  return teams.filter(team => team.id === currentUser.team_id);
};

/**
 * Get default location filter based on user role and location
 */
export const getDefaultLocationFilter = (currentUser: any): 'hanoi' | 'hcm' => {
  return currentUser.location === 'Hà Nội' ? 'hanoi' : 'hcm';
};

/**
 * Check if user should see location tabs
 */
export const shouldShowLocationTabs = (userRole: UserRole): boolean => {
  return userRole === 'retail_director'; // Only directors can switch between locations
};

/**
 * Check if user should see team selector
 */
export const shouldShowTeamSelector = (userRole: UserRole): boolean => {
  return false; // TeamSelector has been removed
};

/**
 * Check if user should see team selector buttons in team-tasks tab
 * Only directors can see and select different teams
 */
export const shouldShowTeamSelectorButtons = (userRole: UserRole): boolean => {
  return userRole === 'retail_director'; // Only directors can switch between teams
};
