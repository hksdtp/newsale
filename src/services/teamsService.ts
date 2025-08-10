import { supabase } from '../shared/api/supabase';

export interface Team {
  id: string;
  name: string;
  location: 'Hà Nội' | 'Hồ Chí Minh';
  leader_id?: string;
  leader?: {
    id: string;
    name: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'team_leader' | 'retail_director';
  team_id: string;
  location: string;
}

class TeamsService {
  /**
   * Lấy tất cả teams
   */
  async getAllTeams(): Promise<Team[]> {
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(
          `
          id,
          name,
          location,
          leader_id,
          leader:users!teams_leader_id_fkey(id, name)
        `
        )
        .order('location', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching teams:', error);
        return [];
      }

      // Fix leader type from array to object
      const fixedTeams =
        teams?.map(team => ({
          ...team,
          leader: Array.isArray(team.leader) ? team.leader[0] : team.leader,
        })) || [];

      return fixedTeams;
    } catch (error) {
      console.error('❌ Error in getAllTeams:', error);
      return [];
    }
  }

  /**
   * Lấy teams theo location
   */
  async getTeamsByLocation(location: 'Hà Nội' | 'Hồ Chí Minh'): Promise<Team[]> {
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(
          `
          id,
          name,
          location,
          leader_id,
          leader:users!teams_leader_id_fkey(id, name)
        `
        )
        .eq('location', location)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching teams by location:', error);
        return [];
      }

      // Fix leader type from array to object
      const fixedTeams =
        teams?.map(team => ({
          ...team,
          leader: Array.isArray(team.leader) ? team.leader[0] : team.leader,
        })) || [];

      return fixedTeams;
    } catch (error) {
      console.error('❌ Error in getTeamsByLocation:', error);
      return [];
    }
  }

  /**
   * Lấy thành viên của team
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const { data: members, error } = await supabase
        .from('users')
        .select(
          `
          id,
          name,
          email,
          role,
          team_id,
          location
        `
        )
        .eq('team_id', teamId)
        .order('role', { ascending: false }) // team_leader first, then employees
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching team members:', error);
        return [];
      }

      return members || [];
    } catch (error) {
      console.error('❌ Error in getTeamMembers:', error);
      return [];
    }
  }

  /**
   * Lấy team theo ID
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select(
          `
          id,
          name,
          location,
          leader_id,
          leader:users!teams_leader_id_fkey(id, name)
        `
        )
        .eq('id', teamId)
        .single();

      if (error || !team) {
        console.error('❌ Error fetching team by ID:', error);
        return null;
      }

      // Fix leader type from array to object
      const fixedTeam = {
        ...team,
        leader: Array.isArray(team.leader) ? team.leader[0] : team.leader,
      };

      return fixedTeam;
    } catch (error) {
      console.error('❌ Error in getTeamById:', error);
      return null;
    }
  }

  /**
   * Kiểm tra user có phải team leader của team không
   */
  async isTeamLeader(userId: string, teamId: string): Promise<boolean> {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('leader_id')
        .eq('id', teamId)
        .single();

      if (error || !team) {
        return false;
      }

      return team.leader_id === userId;
    } catch (error) {
      console.error('❌ Error in isTeamLeader:', error);
      return false;
    }
  }

  /**
   * Lấy teams mà user là leader
   */
  async getTeamsLedByUser(userId: string): Promise<Team[]> {
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(
          `
          id,
          name,
          location,
          leader_id,
          leader:users!teams_leader_id_fkey(id, name)
        `
        )
        .eq('leader_id', userId)
        .order('location', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching teams led by user:', error);
        return [];
      }

      // Fix leader type from array to object
      const fixedTeams =
        teams?.map(team => ({
          ...team,
          leader: Array.isArray(team.leader) ? team.leader[0] : team.leader,
        })) || [];

      return fixedTeams;
    } catch (error) {
      console.error('❌ Error in getTeamsLedByUser:', error);
      return [];
    }
  }
}

export const teamsService = new TeamsService();
