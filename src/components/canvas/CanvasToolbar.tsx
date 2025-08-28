import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Users, CheckSquare, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CanvasToolbarProps {
  onAddNode: (type: 'project' | 'team' | 'task') => void;
}

export function CanvasToolbar({ onAddNode }: CanvasToolbarProps) {
  return (
    <Card className="absolute top-4 left-4 z-10 bg-card border-border shadow-card p-2">
      <div className="flex items-center gap-2">
        {/* Add Nodes */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddNode('project')}
            className="h-8 px-2 hover:bg-project-accent hover:text-primary-foreground transition-colors"
          >
            <FolderKanban className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddNode('team')}
            className="h-8 px-2 hover:bg-project-accent hover:text-primary-foreground transition-colors"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddNode('task')}
            className="h-8 px-2 hover:bg-project-accent hover:text-primary-foreground transition-colors"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-secondary transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-secondary transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-secondary transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}