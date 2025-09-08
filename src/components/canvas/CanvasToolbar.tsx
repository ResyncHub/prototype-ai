import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Users, CheckSquare, RotateCcw, ZoomIn, ZoomOut, Eraser, Link, Unlink, FileText, Palette, User, Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface CanvasToolbarProps {
  onAddNode: (type: 'project' | 'team' | 'task' | 'file' | 'custom' | 'member' | 'company') => void;
  onClearCanvas: () => void;
  selectedCount: number;
}

export function CanvasToolbar({ onAddNode, onClearCanvas, selectedCount }: CanvasToolbarProps) {
  const handleClearCanvas = () => {
    onClearCanvas();
    toast.success("Canvas cleared");
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {/* Main Toolbar */}
      <Card className="bg-card border-border shadow-card p-2">
        <div className="flex items-center gap-2">
          {/* Add Nodes */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddNode('project');
                toast.success("Added new project");
              }}
              className="h-8 px-2 hover:bg-project-accent hover:text-primary-foreground transition-colors"
              title="Add Project (P)"
            >
              <FolderKanban className="h-4 w-4" />
            </Button>
            {/* Team Dropdown */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onAddNode('team');
                  toast.success("Added new team");
                }}
                className="h-8 px-2 hover:bg-project-accent hover:text-primary-foreground transition-colors"
                title="Add Team (T)"
              >
                <Users className="h-4 w-4" />
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-50">
                <div className="bg-card border border-border rounded-lg shadow-lg min-w-[160px] py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onAddNode('member');
                      toast.success("Added new member");
                    }}
                    className="w-full justify-start px-3 py-2 h-auto text-sm hover:bg-accent"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onAddNode('company');
                      toast.success("Added new company");
                    }}
                    className="w-full justify-start px-3 py-2 h-auto text-sm hover:bg-accent"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddNode('task');
                toast.success("Added new task");
              }}
              className="h-8 px-2 hover:bg-project-accent hover:text-primary-foreground transition-colors"
              title="Add Task (K)"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddNode('file');
                toast.success("Added new file node");
              }}
              className="h-8 px-2 hover:bg-project-accent hover:text-primary-foreground transition-colors"
              title="Add File Node (F)"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddNode('custom');
                toast.success("Added new custom node");
              }}
              className="h-8 px-2 hover:bg-project-accent hover:text-primary-foreground transition-colors"
              title="Add Custom Node (C)"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Edit Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCanvas}
              className="h-8 px-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              title="Clear Canvas"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* View Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-secondary transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-secondary transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-secondary transition-colors"
              title="Reset View (R)"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Selection Info */}
      {selectedCount > 0 && (
        <Card className="bg-card border-border shadow-card p-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedCount} selected
            </Badge>
            <span className="text-xs text-muted-foreground">
              Drag to move • Shift+Click for multi-select
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}