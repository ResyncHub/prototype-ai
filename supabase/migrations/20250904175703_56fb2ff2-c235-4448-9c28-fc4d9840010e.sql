-- Add new columns to projects table for enhanced functionality
ALTER TABLE public.projects 
ADD COLUMN description TEXT,
ADD COLUMN color TEXT DEFAULT '#DC2626',
ADD COLUMN icon TEXT DEFAULT 'FolderKanban',
ADD COLUMN last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for better performance on last_accessed_at
CREATE INDEX idx_projects_last_accessed ON public.projects(user_id, last_accessed_at DESC);

-- Update the trigger to also update last_accessed_at on updates
CREATE OR REPLACE FUNCTION public.update_project_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_timestamps
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_project_timestamps();