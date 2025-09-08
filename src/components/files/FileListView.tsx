import React from 'react';
import { FileText, Download, Trash2, Image, FileType, FileIcon, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface FileListViewProps {
  files: any[];
  loading: boolean;
  onDelete: (fileId: string) => void;
  onRename: (fileId: string, newName: string) => void;
  onFileSelect?: (file: any) => void;
}

const getFileIcon = (fileType: string) => {
  const iconClass = "h-4 w-4";
  
  switch (fileType) {
    case 'image':
      return <Image className={cn(iconClass, "text-blue-500")} />;
    case 'pdf':
      return <FileType className={cn(iconClass, "text-red-500")} />;
    case 'document':
      return <FileText className={cn(iconClass, "text-blue-600")} />;
    case 'text':
      return <FileIcon className={cn(iconClass, "text-green-600")} />;
    default:
      return <FileText className={cn(iconClass, "text-gray-500")} />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileTypeColor = (fileType: string) => {
  switch (fileType) {
    case 'image':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'pdf':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'document':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'text':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const FileListView = ({ files, loading, onDelete, onRename, onFileSelect }: FileListViewProps) => {
  const handleDragStart = (e: React.DragEvent, file: any) => {
    const fileData = {
      filename: file.filename,
      originalFilename: file.original_filename,
      fileSize: file.file_size,
      fileType: file.file_type,
      fileUrl: file.file_url,
      mimeType: file.mime_type,
      uploadedAt: file.created_at
    };
    e.dataTransfer.setData('application/json', JSON.stringify(fileData));
  };

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-2">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <div className="flex-1">
                <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
              <div className="w-12 h-5 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-1">No files uploaded yet</p>
        <p className="text-xs text-muted-foreground">
          Upload files using the Upload tab
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, file)}
            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer group transition-colors"
            onClick={() => onFileSelect?.(file)}
          >
            <div className="flex-shrink-0">
              {getFileIcon(file.file_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" title={file.original_filename}>
                {file.original_filename}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.file_size)}
                </p>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs h-4 px-1", getFileTypeColor(file.file_type))}
                >
                  {file.file_type.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(file.file_url, '_blank');
                }}
              >
                <Download className="h-3 w-3" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete File</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{file.original_filename}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(file.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};