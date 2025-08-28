import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, AlertCircle } from "lucide-react";

interface ProjectNodeData {
  title: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  members: number;
  progress: number;
  priority: 'low' | 'medium' | 'high';
}

interface ProjectNodeProps {
  data: ProjectNodeData;
}

const statusColors = {
  planning: 'bg-muted text-muted-foreground',
  active: 'bg-primary text-primary-foreground',
  completed: 'bg-green-600 text-white',
  on_hold: 'bg-orange-500 text-white'
};

const priorityColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400'
};

function ProjectNode({ data }: ProjectNodeProps) {
  return (
    <Card className="w-64 bg-gradient-card border-border shadow-card hover:shadow-card-hover transition-all duration-300 nodrag">
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
      
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-card-foreground text-sm line-clamp-2">
            {data.title}
          </h3>
          <AlertCircle className={`h-4 w-4 ${priorityColors[data.priority]} ml-2 flex-shrink-0`} />
        </div>
        
        {/* Status Badge */}
        <Badge className={`${statusColors[data.status]} text-xs px-2 py-1 rounded-md`}>
          {data.status.replace('_', ' ')}
        </Badge>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{data.progress}%</span>
          </div>
          <Progress value={data.progress} className="h-2" />
        </div>
        
        {/* Members */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{data.members} members</span>
        </div>
      </div>
    </Card>
  );
}

export default memo(ProjectNode);