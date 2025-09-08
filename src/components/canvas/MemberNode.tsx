import { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, Building, X } from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface MemberNodeData extends Record<string, unknown> {
  name: string;
  role: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  isNew?: boolean;
}

interface MemberNodeProps {
  data: MemberNodeData;
  id: string;
}

const statusColors = {
  active: 'bg-green-500/20 text-green-300 border border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
};

function MemberNode({ data, id }: MemberNodeProps) {
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
    <Card className={`w-56 bg-gradient-to-br from-cyan-950/50 to-blue-900/30 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:border-cyan-400/50 transition-all duration-300 relative group rounded-xl ${data.isNew ? 'new-member-animation' : ''}`}>
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="!bg-cyan-500 !border-cyan-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="!bg-cyan-500 !border-cyan-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="!bg-cyan-500 !border-cyan-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="!bg-cyan-500 !border-cyan-400 !w-4 !h-4 !border-2 !rounded-full" 
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
        nodeType="Member"
      />
      
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-cyan-500/30">
            <AvatarFallback className="bg-cyan-500/30 text-cyan-200 font-semibold">
              {data.name.split(' ').map(n => n.charAt(0)).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-cyan-100 text-sm line-clamp-1">
              {data.name}
            </h3>
            <p className="text-xs text-cyan-300/70">
              {data.role}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <Badge className={`${statusColors[data.status]} text-xs px-2 py-1 rounded-md`}>
          {data.status}
        </Badge>
        
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="line-clamp-1">{data.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building className="h-3 w-3" />
            <span>{data.department}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(MemberNode);