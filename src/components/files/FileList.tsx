import React, { useState, useMemo } from 'react';
import { FileText, Download, Trash2, Edit2, Search, Filter, Grid, List, Calendar, FileIcon, Image, FileType } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/hooks/useFileUpload';
import { format } from 'date-fns';

interface FileListProps {
  files: FileUpload[];
  loading: boolean;
  onDelete: (fileId: string) => void;
  onRename: (fileId: string, newName: string) => void;
  onFileSelect?: (file: FileUpload) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';

export const FileList = ({ files, loading, onDelete, onRename, onFileSelect }: FileListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const getFileIcon = (fileType: string, mimeType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'pdf':
        return <FileType className="h-8 w-8 text-red-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'text':
        return <FileIcon className="h-8 w-8 text-green-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(file => 
        file.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(file => file.file_type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.original_filename.localeCompare(b.original_filename);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'size':
          return b.file_size - a.file_size;
        case 'type':
          return a.file_type.localeCompare(b.file_type);
        default:
          return 0;
      }
    });

    return result;
  }, [files, searchQuery, filterType, sortBy]);

  const handleDownload = (file: FileUpload) => {
    window.open(file.file_url, '_blank');
  };

  const handleRename = (fileId: string, currentName: string) => {
    setRenameFileId(fileId);
    setRenameValue(currentName);
  };

  const submitRename = () => {
    if (renameFileId && renameValue.trim()) {
      onRename(renameFileId, renameValue.trim());
      setRenameFileId(null);
      setRenameValue('');
    }
  };

  const fileTypes = useMemo(() => {
    const types = [...new Set(files.map(f => f.file_type))];
    return types.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }));
  }, [files]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Files ({files.length})
          </CardTitle>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
            <ToggleGroupItem value="grid" size="sm">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" size="sm">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="File type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {fileTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="size">Sort by Size</SelectItem>
              <SelectItem value="type">Sort by Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredAndSortedFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {files.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
            </h3>
            <p className="text-muted-foreground">
              {files.length === 0 
                ? 'Drag files here or click the upload button to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-2'
          )}>
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'group border rounded-lg transition-colors hover:bg-accent/50',
                  viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center gap-4',
                  onFileSelect && 'cursor-pointer'
                )}
                onClick={() => onFileSelect?.(file)}
              >
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {getFileIcon(file.file_type, file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate" title={file.original_filename}>
                          {file.original_filename}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {file.file_type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(file.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog 
                        open={renameFileId === file.id} 
                        onOpenChange={(open) => !open && setRenameFileId(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(file.id, file.original_filename);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rename File</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Label>File Name</Label>
                            <Input
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              placeholder="Enter new file name"
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setRenameFileId(null)}>
                              Cancel
                            </Button>
                            <Button onClick={submitRename}>
                              Rename
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
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
                            <AlertDialogAction onClick={() => onDelete(file.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <>
                    {getFileIcon(file.file_type, file.mime_type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate" title={file.original_filename}>
                        {file.original_filename}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{format(new Date(file.created_at), 'MMM dd, yyyy')}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.file_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog 
                        open={renameFileId === file.id} 
                        onOpenChange={(open) => !open && setRenameFileId(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(file.id, file.original_filename);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rename File</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Label>File Name</Label>
                            <Input
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              placeholder="Enter new file name"
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setRenameFileId(null)}>
                              Cancel
                            </Button>
                            <Button onClick={submitRename}>
                              Rename
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
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
                            <AlertDialogAction onClick={() => onDelete(file.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};