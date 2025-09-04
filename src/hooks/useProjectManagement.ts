import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Project } from './useProjects';

export const useProjectManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateLastAccessed = async (projectId: string) => {
    try {
      await supabase
        .from('projects')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', projectId);
    } catch (error) {
      console.error('Error updating last accessed:', error);
    }
  };

  const duplicateProject = async (project: Project) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: `${project.name} (Copy)`,
          description: project.description,
          color: project.color,
          icon: project.icon,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project duplicated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate project",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchProjects = async (query: string): Promise<Project[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  };

  const getRecentProjects = async (limit: number = 5): Promise<Project[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      return [];
    }
  };

  return {
    loading,
    updateLastAccessed,
    duplicateProject,
    searchProjects,
    getRecentProjects,
  };
};