import { useState } from "react";
import { MoreVertical, Edit3, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Project } from "@/hooks/useProjects";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";

interface ProjectActionsMenuProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: (newProject: Project) => void;
}

export const ProjectActionsMenu = ({ 
  project, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: ProjectActionsMenuProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { duplicateProject, loading } = useProjectManagement();
  const { toast } = useToast();
  const { setOpen } = useSidebar();

  const handleDuplicate = async () => {
    try {
      const newProject = await duplicateProject(project);
      onDuplicate?.(newProject);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDelete();
  };

  return (
    <>
      <DropdownMenu onOpenChange={(open) => open && setOpen(true)}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          side="right"
          align="start"
          sideOffset={6}
          alignOffset={0}
          avoidCollisions={false}
          className="w-48 bg-popover border border-border"
        >
          <DropdownMenuItem onClick={onEdit}>
            <Edit3 className="mr-2 h-4 w-4" />
            Rename Project
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDuplicate}
            disabled={loading}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Project
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};