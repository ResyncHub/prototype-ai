import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FileUpload {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  storage_path: string;
  uploaded_by: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  id: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

export const useFileUpload = (projectId: string | null) => {
  const { user } = useAuth();
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 50MB.`;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported. Allowed types: PDF, DOCX, TXT, PNG, JPG, JPEG.`;
    }
    
    return null;
  };

  const uploadFiles = useCallback(async (fileList: File[]) => {
    if (!projectId || !user) {
      toast.error('Please select a project and ensure you are logged in');
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate all files first
    fileList.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Show validation errors
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length === 0) return;

    // Initialize upload queue
    const initialQueue: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
      id: crypto.randomUUID()
    }));

    setUploadQueue(initialQueue);

    // Upload files sequentially to avoid overwhelming the system
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const queueItem = initialQueue[i];
      
      try {
        // Generate unique filename to avoid conflicts
        const fileExtension = file.name.split('.').pop();
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${timestamp}_${sanitizedName}`;
        const storagePath = `${projectId}/${uniqueFilename}`;

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('project-files')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) throw storageError;

        // Get signed URL for the uploaded file
        const { data: urlData } = await supabase.storage
          .from('project-files')
          .createSignedUrl(storagePath, 3600 * 24 * 365); // 1 year expiry

        if (!urlData?.signedUrl) throw new Error('Failed to generate file URL');

        // Save file metadata to database
        const { data: dbData, error: dbError } = await supabase
          .from('project_files' as any)
          .insert({
            project_id: projectId,
            filename: uniqueFilename,
            original_filename: file.name,
            file_url: urlData.signedUrl,
            file_size: file.size,
            file_type: getFileType(file.type),
            mime_type: file.type,
            storage_path: storagePath,
            uploaded_by: user.id
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Update queue item status
        setUploadQueue(prev => prev.map(item => 
          item.id === queueItem.id 
            ? { ...item, progress: 100, status: 'completed' }
            : item
        ));

        // Add to files list
        setFiles(prev => [(dbData as any) as FileUpload, ...prev]);

        toast.success(`File "${file.name}" uploaded successfully`);

      } catch (error) {
        console.error('Upload error:', error);
        
        // Update queue item with error
        setUploadQueue(prev => prev.map(item => 
          item.id === queueItem.id 
            ? { ...item, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : item
        ));

        toast.error(`Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Clear completed/error uploads after a delay
    setTimeout(() => {
      setUploadQueue(prev => prev.filter(item => item.status === 'uploading'));
    }, 3000);
    
  }, [projectId, user]);

  const fetchFiles = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_files' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(((data || []) as any) as FileUpload[]);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const deleteFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_files' as any)
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Update local state
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success(`File "${file.original_filename}" deleted successfully`);

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  }, [files]);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('project_files' as any)
        .update({ original_filename: newName })
        .eq('id', fileId);

      if (error) throw error;

      // Update local state
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, original_filename: newName } : f
      ));

      toast.success('File renamed successfully');
    } catch (error) {
      console.error('Rename error:', error);
      toast.error('Failed to rename file');
    }
  }, []);

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'document';
    if (mimeType === 'text/plain') return 'text';
    return 'other';
  };

  return {
    files,
    uploadQueue,
    loading,
    uploadFiles,
    fetchFiles,
    deleteFile,
    renameFile,
    validateFile
  };
};