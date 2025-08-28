import { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Circle, Clock, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskNodeData {
  title: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
}

interface TaskNodeProps {
  data: TaskNodeData;
  id: string;
}

const statusConfig = {
  todo: {
    icon: Circle,
    color: 'bg-muted text-muted-foreground',
    iconColor: 'text-muted-foreground'
  },
  in_progress: {
    icon: Clock,
    color: 'bg-blue-600 text-white',
    iconColor: 'text-blue-400'
  },
  completed: {
    icon: CheckCircle2,
    color: 'bg-green-600 text-white',
    iconColor: 'text-green-400'
  }
};

function TaskNode({ data, id }: TaskNodeProps) {
  const { setNodes, setEdges } = useReactFlow();
  const status = statusConfig[data.status];
  const StatusIcon = status.icon;

  const deleteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <Card className="w-52 bg-gradient-card border-border shadow-card hover:shadow-card-hover transition-all duration-300 nodrag relative group">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-project-accent !border-project-accent !w-3 !h-3" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-project-accent !border-project-accent !w-3 !h-3" 
      />
      
      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={deleteNode}
        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="h-3 w-3" />
      </Button>
      
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-2">
          <StatusIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${status.iconColor}`} />
          <h3 className="font-medium text-card-foreground text-sm line-clamp-2">
            {data.title}
          </h3>
        </div>
        
        {/* Status Badge */}
        <Badge className={`${status.color} text-xs px-2 py-1 rounded-md`}>
          {data.status.replace('_', ' ')}
        </Badge>
        
        {/* Assignee */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-project-accent text-primary-foreground">
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