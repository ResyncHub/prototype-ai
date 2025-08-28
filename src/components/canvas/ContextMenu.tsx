import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit3, Trash2, Copy, Settings } from "lucide-react";

interface NodeContextMenuProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  nodeType: string;
}

export function NodeContextMenu({ children, onEdit, onDelete, onDuplicate, nodeType }: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-card border-border shadow-lg">
        <ContextMenuItem onClick={onEdit} className="flex items-center gap-2 cursor-pointer hover:bg-accent">
          <Edit3 className="h-4 w-4" />
          Edit {nodeType}
        </ContextMenuItem>
        {onDuplicate && (
          <ContextMenuItem onClick={onDuplicate} className="flex items-center gap-2 cursor-pointer hover:bg-accent">
            <Copy className="h-4 w-4" />
            Duplicate
          </ContextMenuItem>
        )}
        <ContextMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-accent">
          <Settings className="h-4 w-4" />
          Properties
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="flex items-center gap-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-destructive">
          <Trash2 className="h-4 w-4" />
          Delete {nodeType}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}