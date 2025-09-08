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
    <Card className={`w-56 bg-gradient-to-br from-green-950/50 to-emerald-900/30 border-2 border-green-500/30 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:border-green-400/50 transition-all duration-300 relative group rounded-lg ${data.isNew ? 'new-team-animation' : ''}`}>
      {/* Left handles - both source and target */}
      <Handle 
        id="left-source"
        type="source" 
        position={Position.Left} 
        className="!bg-green-500 !border-green-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        id="left-target"
        type="target" 
        position={Position.Left} 
        className="!bg-green-500 !border-green-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      
      {/* Top handles - both source and target */}
      <Handle 
        id="top-source"
        type="source" 
        position={Position.Top} 
        className="!bg-green-500 !border-green-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        id="top-target"
        type="target" 
        position={Position.Top} 
        className="!bg-green-500 !border-green-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      
      {/* Right handles - both source and target */}
      <Handle 
        id="right-source"
        type="source" 
        position={Position.Right} 
        className="!bg-green-500 !border-green-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        id="right-target"
        type="target" 
        position={Position.Right} 
        className="!bg-green-500 !border-green-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      
      {/* Bottom handles - both source and target */}
      <Handle 
        id="bottom-source"
        type="source" 
        position={Position.Bottom} 
        className="!bg-green-500 !border-green-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        id="bottom-target"
        type="target" 
        position={Position.Bottom} 
        className="!bg-green-500 !border-green-400 !w-4 !h-4 !border-2 !rounded-full" 
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
          <div className="p-1.5 bg-green-500/20 rounded-md">
            <Users className="h-4 w-4 text-green-400" />
          </div>
          <h3 className="font-bold text-green-100 text-sm">
            {data.name}
          </h3>
        </div>
        
        {/* Role Badge */}
        <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs px-2 py-1 rounded-md">
          {data.role}
        </Badge>
        
        {/* Members */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{data.members.length} members</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {data.members.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="w-6 h-6 border border-green-500/30">
                <AvatarFallback className="text-xs bg-green-500/30 text-green-200">
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