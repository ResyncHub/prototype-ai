import { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface TeamNodeData {
  name: string;
  members: string[];
  role: string;
  isNew?: boolean;
}

interface TeamNodeProps {
  data: TeamNodeData;
  id: string;
}

function TeamNode({ data, id }: TeamNodeProps) {
  const { setNodes, setEdges } = useReactFlow();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <Card className={`w-56 bg-gradient-card border-border shadow-card hover:shadow-card-hover transition-all duration-300 relative group ${data.isNew ? 'new-node-animation' : ''}`}>
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
        title={data.name}
        nodeType="Team"
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