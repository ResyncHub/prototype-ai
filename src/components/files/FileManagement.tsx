import React, { useEffect, useCallback } from 'react';
import { FileUploadZone } from './FileUploadZone';
import { FileList } from './FileList';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useProject } from '@/contexts/ProjectContext';

interface FileManagementProps {
  onFileSelect?: (file: any) => void;
}

export const FileManagement = ({ onFileSelect }: FileManagementProps) => {
  const { currentProject } = useProject();
  const {
    files,
    uploadQueue,
    loading,
    uploadFiles,
    fetchFiles,
    deleteFile,
    renameFile
  } = useFileUpload(currentProject?.id || null);

  // Fetch files when project changes
  useEffect(() => {
    if (currentProject?.id) {
      fetchFiles();
    }
  }, [currentProject?.id, fetchFiles]);

  const handleClearQueue = useCallback(() => {
    // Clear completed and error items from queue
    // This would be implemented in the hook if needed
  }, []);

  if (!currentProject) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Please select a project to manage files</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <FileUploadZone
        onFilesSelected={uploadFiles}
        uploadQueue={uploadQueue}
        onClearQueue={handleClearQueue}
      />
      
      <FileList
        files={files}
        loading={loading}
        onDelete={deleteFile}
        onRename={renameFile}
        onFileSelect={onFileSelect}
      />
    </div>
  );
};