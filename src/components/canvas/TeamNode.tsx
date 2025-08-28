import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface TeamNodeData {
  name: string;
  members: string[];
  role: string;
}

interface TeamNodeProps {
  data: TeamNodeData;
}

function TeamNode({ data }: TeamNodeProps) {
  return (
    <Card className="w-56 bg-gradient-card border-border shadow-card hover:shadow-card-hover transition-all duration-300 nodrag">
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
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-project-accent" />
          <h3 className="font-semibold text-card-foreground text-sm">
            {data.name}
          </h3>
        </div>
        
        {/* Role Badge */}
        <Badge className="bg-project-accent text-project-accent bg-opacity-20 text-xs px-2 py-1 rounded-md">
          {data.role}
        </Badge>
        
        {/* Members */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{data.members.length} members</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {data.members.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="w-6 h-6">
                <AvatarFallback className="text-xs bg-project-accent text-primary-foreground">
                  {member.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {data.members.length > 3 && (
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{data.members.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(TeamNode);