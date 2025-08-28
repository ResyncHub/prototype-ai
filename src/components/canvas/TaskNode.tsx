import { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Circle, Clock, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface TaskNodeData {
  title: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  isNew?: boolean;
}

interface TaskNodeProps {
  data: TaskNodeData;
  id: string;
}

const statusConfig = {
  todo: {
    icon: Circle,
    color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    iconColor: 'text-orange-400'
  },
  in_progress: {
    icon: Clock,
    color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  completed: {
    icon: CheckCircle2,
    color: 'bg-green-500/20 text-green-300 border border-green-500/30',
    iconColor: 'text-green-400'
  }
};

function TaskNode({ data, id }: TaskNodeProps) {
  const { setNodes, setEdges } = useReactFlow();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const status = statusConfig[data.status];
  const StatusIcon = status.icon;

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <Card className={`w-52 bg-gradient-to-br from-orange-950/50 to-amber-900/30 border-2 border-orange-500/30 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:border-orange-400/50 transition-all duration-300 relative group rounded-xl ${data.isNew ? 'new-task-animation' : ''}`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-orange-500 !border-orange-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-orange-500 !border-orange-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      
      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDeleteClick}
        className="nodrag absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={deleteNode}
        title={data.title}
        nodeType="Task"
      />
      
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-orange-500/20 rounded">
              <StatusIcon className={`h-3 w-3 ${status.iconColor}`} />
            </div>
            <h3 className="font-bold text-orange-100 text-sm line-clamp-1">
              {data.title}
            </h3>
          </div>
        </div>
        
        {/* Status Badge */}
        <Badge className={`${status.color} text-xs px-2 py-1 rounded-md`}>
          {data.status.replace('_', ' ')}
        </Badge>
        
        {/* Assignee */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 border border-orange-500/30">
            <AvatarFallback className="text-xs bg-orange-500/30 text-orange-200">
              {data.assignee.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{data.assignee}</span>
        </div>
        
        {/* Due Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{new Date(data.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}

export default memo(TaskNode);