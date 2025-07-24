import { supabase } from '../../../shared/api/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  team_id: string;
  location: string;
  password: string;
  password_changed: boolean;
  role: 'employee' | 'team_leader' | 'retail_director';
  department_type: string;
  created_at: string;
  updated_at: string;
  team?: {
    id: string;
    name: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  email: string;
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  // Get all users for user selection
  async getUsers(): Promise<User[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    if (!users || users.length === 0) {
      return [];
    }

    // Get all unique team IDs
    const teamIds = [...new Set(users.map(user => user.team_id))].filter(Boolean);

    let teamsMap = new Map();
    if (teamIds.length > 0) {
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds);

      if (teams) {
        teams.forEach(team => teamsMap.set(team.id, team));
      }
    }

    // Combine users with team info
    return users.map(user => ({
      ...user,
      team: user.team_id ? teamsMap.get(user.team_id) || null : null
    }));
  }

  // Get users by location
  async getUsersByLocation(location: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        team:teams(id, name)
      `)
      .eq('location', location)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch users by location: ${error.message}`);
    }

    return data || [];
  }

  // Get users by team and location
  async getUsersByTeamAndLocation(teamId: string, location: string): Promise<User[]> {
    // First get users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('team_id', teamId)
      .eq('location', location)
      .order('name');

    if (usersError) {
      throw new Error(`Failed to fetch users by team and location: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return [];
    }

    // Get team info separately
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', teamId)
      .single();

    if (teamError) {
      console.warn('Could not fetch team info:', teamError.message);
    }

    // Combine users with team info
    return users.map(user => ({
      ...user,
      team: team || null
    }));
  }

  // Get director (Khổng Đức Mạnh)
  async getDirector(): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'retail_director')
      .single();

    if (error) {
      return null;
    }

    if (!user) {
      return null;
    }

    // Get team info separately if needed
    let team = null;
    if (user.team_id) {
      const { data: teamData } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', user.team_id)
        .single();

      team = teamData;
    }

    return {
      ...user,
      team
    };
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<User> {
    const { email, password } = credentials;

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Email không tồn tại trong hệ thống');
    }

    // Password verification
    const isValidPassword = password === user.password ||
                           (!user.password_changed && password === '123456');

    if (!isValidPassword) {
      throw new Error('Mật khẩu không đúng');
    }

    // Get team info separately
    let team = null;
    if (user.team_id) {
      const { data: teamData } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', user.team_id)
        .single();

      team = teamData;
    }

    // Update last login timestamp
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id);

    return {
      ...user,
      team
    };
  }

  // Change password (for first-time login)
  async changePassword(data: ChangePasswordData): Promise<void> {
    const { email, currentPassword, newPassword } = data;

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Người dùng không tồn tại');
    }

    // Verify current password
    const isValidPassword = currentPassword === user.password ||
                           (!user.password_changed && currentPassword === '123456');

    if (!isValidPassword) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    // Update password and mark as changed
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: newPassword,
        password_changed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return null;
    }

    // Get team info separately
    let team = null;
    if (user.team_id) {
      const { data: teamData } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', user.team_id)
        .single();

      team = teamData;
    }

    return {
      ...user,
      team
    };
  }

  // Check if user needs to change password
  async needsPasswordChange(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return !user?.password_changed || false;
  }

  // Get teams
  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch teams: ${error.message}`);
    }

    return data || [];
  }

  // Get teams by location with team leader info
  async getTeamsByLocation(location: string) {
    // First get all users in the location
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('team_id, name, role')
      .eq('location', location);

    if (usersError) {
      throw new Error(`Failed to fetch users by location: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return [];
    }

    // Get unique team IDs
    const teamIds = [...new Set(users.map(user => user.team_id))].filter(Boolean);

    if (teamIds.length === 0) {
      return [];
    }

    // Get teams by IDs
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .in('id', teamIds)
      .order('name');

    if (teamsError) {
      throw new Error(`Failed to fetch teams: ${teamsError.message}`);
    }

    if (!teams) {
      return [];
    }

    // Add team leader info to each team
    const teamsWithLeaders = teams.map(team => {
      const teamLeader = users.find(user =>
        user.team_id === team.id && user.role === 'team_leader'
      );

      return {
        ...team,
        leader_name: teamLeader?.name || null
      };
    });

    return teamsWithLeaders;
  }
}

export const authService = new AuthService();
