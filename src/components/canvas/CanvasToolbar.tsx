import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Users, CheckSquare, RotateCcw, ZoomIn, ZoomOut, Trash2, Eraser, Link, Unlink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface CanvasToolbarProps {
  onAddNode: (type: 'project' | 'team' | 'task') => void;
  onDeleteSelected?: () => void;
  onClearCanvas: () => void;
  selectedCount: number;
}

export function CanvasToolbar({ onAddNode, onDeleteSelected, onClearCanvas, selectedCount }: CanvasToolbarProps) {
  const handleClearCanvas = () => {
    onClearCanvas();
    toast.success("Canvas cleared");
  };

  const handleDeleteSelected = () => {
    if (onDeleteSelected) {
      onDeleteSelected();
      toast.success(`Deleted ${selectedCount} items`);
    }
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
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Edit Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={!onDeleteSelected}
              className="h-8 px-2 hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
              title="Delete Selected (Del)"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
              Press Del to delete • Drag to move • Shift+Click for multi-select
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}