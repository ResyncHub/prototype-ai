import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Image, FileType, FileIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface FileNodeData extends Record<string, unknown> {
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  mimeType: string;
  uploadedAt: string;
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
  const { deleteElements } = useReactFlow();

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const handleDownload = () => {
    window.open(data.fileUrl, '_blank');
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

  return (
    <Card 
      className={cn(
        "min-w-[280px] shadow-lg border-2 transition-all hover:shadow-xl bg-card",
        data.isNew && "new-node-animation new-file-animation",
        "nodrag"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
      
      <CardContent className="p-4 space-y-3">
        {/* File Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getFileIcon(data.fileType, 8)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate" title={data.originalFilename}>
              {data.originalFilename}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(data.fileSize)}
            </p>
          </div>

          <Badge 
            variant="outline" 
            className={cn("text-xs", getFileTypeColor(data.fileType))}
          >
            {data.fileType.toUpperCase()}
          </Badge>
        </div>

        {/* File Info */}
        <div className="text-xs text-muted-foreground">
          <p>Uploaded: {new Date(data.uploadedAt).toLocaleDateString()}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1 hover:bg-primary hover:text-primary-foreground"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove File Node</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this file from the canvas? This won't delete the actual file from your project.
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
      </CardContent>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-file-accent border-2 border-white"
      />
    </Card>
  );
};

export default memo(FileNode);