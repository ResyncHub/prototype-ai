import React, { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Image, FileType, FileIcon, Plus, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface FileData {
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  mimeType: string;
  uploadedAt: string;
}

interface FileNodeData extends Record<string, unknown> {
  title?: string;
  files?: FileData[];
  isNew?: boolean;
}

interface FileNodeProps extends NodeProps {
  data: FileNodeData;
}

const getFileIcon = (fileType: string, size = 6) => {
  const iconClass = `h-${size} w-${size}`;
  
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

const FileNode = ({ data, id }: FileNodeProps) => {
  const { deleteElements, updateNode } = useReactFlow();
  const [isDragOver, setIsDragOver] = useState(false);

  const files = data.files || [];
  const title = data.title || "File Container";

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleRemoveFile = useCallback((fileIndex: number) => {
    const newFiles = files.filter((_, index) => index !== fileIndex);
    updateNode(id, { data: { ...data, files: newFiles } });
  }, [files, id, data, updateNode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const fileData = JSON.parse(e.dataTransfer.getData('application/json'));
      const newFiles = [...files, fileData];
      updateNode(id, { data: { ...data, files: newFiles } });
    } catch (error) {
      console.error('Error adding file to node:', error);
    }
  }, [files, id, data, updateNode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

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

  return (
    <Card 
      className={cn(
        "w-56 shadow-lg border-2 transition-all hover:shadow-xl bg-card",
        data.isNew && "new-node-animation new-file-animation",
        isDragOver && "border-primary bg-primary/5"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Left handles - both source and target */}
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
      
      {/* Top handles - both source and target */}
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground nodrag"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove File Container</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this file container from the canvas?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">No files yet</p>
            <p className="text-xs text-muted-foreground">
              Drag files from the sidebar to add them here
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 group"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file.fileType, 4)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" title={file.originalFilename}>
                    {file.originalFilename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground nodrag"
                    onClick={() => handleDownload(file.fileUrl)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground nodrag"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Right handles - both source and target */}
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
      
      {/* Bottom handles - both source and target */}
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
    </Card>
  );
};

export default memo(FileNode);