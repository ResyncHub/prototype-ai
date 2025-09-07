import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UploadProgress } from '@/hooks/useFileUpload';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  uploadQueue: UploadProgress[];
  onClearQueue: () => void;
  className?: string;
}

export const FileUploadZone = ({ onFilesSelected, uploadQueue, onClearQueue, className }: FileUploadZoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    }
  });

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Upload className="h-4 w-4 text-muted-foreground animate-pulse" />;
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card 
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive 
            ? 'border-primary bg-primary/5 shadow-lg' 
            : 'border-muted-foreground/25 hover:border-primary hover:bg-accent/50'
        )}
      >
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center space-y-4">
            <input {...getInputProps()} />
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className={cn(
                'h-8 w-8 transition-colors',
                isDragActive ? 'text-primary animate-bounce' : 'text-primary'
              )} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop files here' : 'Upload project files'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop files here, or click to browse
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">DOCX</Badge>
                <Badge variant="outline">TXT</Badge>
                <Badge variant="outline">PNG</Badge>
                <Badge variant="outline">JPG</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Maximum file size: 50MB
              </p>
            </div>
            <Button type="button" variant="outline" className="pointer-events-none">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Upload Progress</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearQueue}
                disabled={uploadQueue.some(item => item.status === 'uploading')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {uploadQueue.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="text-right">
                      {item.status === 'uploading' && (
                        <span className="text-sm text-muted-foreground">{item.progress}%</span>
                      )}
                      {item.status === 'completed' && (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Complete
                        </Badge>
                      )}
                      {item.status === 'error' && (
                        <Badge variant="destructive">
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-2" />
                  )}
                  {item.status === 'error' && item.error && (
                    <p className="text-xs text-destructive">{item.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};