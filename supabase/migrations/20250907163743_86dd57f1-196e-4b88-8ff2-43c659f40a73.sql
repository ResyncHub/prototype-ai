-- Create project_files table for file metadata
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  processed_for_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Create policies for project files
CREATE POLICY "Users can only access files from their projects"
ON public.project_files
FOR ALL
USING (project_id IN (
  SELECT projects.id FROM projects 
  WHERE projects.user_id = auth.uid()
));

-- Create file_canvas_nodes table for linking files to canvas nodes
CREATE TABLE public.file_canvas_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
  node_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for file_canvas_nodes
ALTER TABLE public.file_canvas_nodes ENABLE ROW LEVEL SECURITY;

-- Create policy for file_canvas_nodes
CREATE POLICY "Users can only access their file-node relationships"
ON public.file_canvas_nodes
FOR ALL
USING (file_id IN (
  SELECT pf.id FROM project_files pf
  JOIN projects p ON pf.project_id = p.id
  WHERE p.user_id = auth.uid()
));

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false);

-- Create storage policies for project files
CREATE POLICY "Users can view their project files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-files' AND 
  (storage.foldername(name))[1] IN (
    SELECT projects.id::text FROM projects 
    WHERE projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload to their project folders"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND 
  (storage.foldername(name))[1] IN (
    SELECT projects.id::text FROM projects 
    WHERE projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their project files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'project-files' AND 
  (storage.foldername(name))[1] IN (
    SELECT projects.id::text FROM projects 
    WHERE projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their project files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-files' AND 
  (storage.foldername(name))[1] IN (
    SELECT projects.id::text FROM projects 
    WHERE projects.user_id = auth.uid()
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_project_files_updated_at
BEFORE UPDATE ON public.project_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();