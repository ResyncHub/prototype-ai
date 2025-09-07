import React, { useState } from 'react';
import { FileText, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileManagement } from './FileManagement';
import { useProject } from '@/contexts/ProjectContext';

interface FilesTabProps {
  onAddFileNode?: (fileData: any) => void;
}

export const FilesTab = ({ onAddFileNode }: FilesTabProps) => {
  const { currentProject } = useProject();
  
  const handleFileSelect = (file: any) => {
    if (onAddFileNode) {
      const fileNodeData = {
        filename: file.filename,
        originalFilename: file.original_filename,
        fileSize: file.file_size,
        fileType: file.file_type,
        fileUrl: file.file_url,
        mimeType: file.mime_type,
        uploadedAt: file.created_at
      };
      // Use the window global function to add file to canvas
      if ((window as any).addFileNodeToCanvas) {
        (window as any).addFileNodeToCanvas(fileNodeData);
      }
    }
  };

  if (!currentProject) {
    return (
      <div className="p-4 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Select a project to manage files</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Project Files</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload and manage files for {currentProject.name}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="manage" className="h-full flex flex-col">
          <div className="px-4 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="manage" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Manage
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="manage" className="flex-1 mt-0">
            <FileManagement onFileSelect={handleFileSelect} />
          </TabsContent>

          <TabsContent value="upload" className="flex-1 mt-0">
            <div className="p-4">
              <FileManagement onFileSelect={handleFileSelect} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};