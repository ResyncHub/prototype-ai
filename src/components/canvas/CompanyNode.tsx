import { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, TrendingUp, X } from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface CompanyNodeData extends Record<string, unknown> {
  name: string;
  industry: string;
  size: string;
  location: string;
  status: 'active' | 'inactive' | 'prospect';
  isNew?: boolean;
}

interface CompanyNodeProps {
  data: CompanyNodeData;
  id: string;
}

const statusColors = {
  active: 'bg-green-500/20 text-green-300 border border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  prospect: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
};

function CompanyNode({ data, id }: CompanyNodeProps) {
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
    <Card className={`w-56 bg-gradient-to-br from-indigo-950/50 to-purple-900/30 border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:border-indigo-400/50 transition-all duration-300 relative group rounded-xl ${data.isNew ? 'new-company-animation' : ''}`}>
      {/* Two connectors only: target (left) and source (right) */}
      <Handle 
        id="left-target"
        type="target" 
        position={Position.Left} 
        className="!bg-indigo-500 !border-indigo-400 !w-4 !h-4 !border-2 !rounded-full" 
      />
      <Handle 
        id="right-source"
        type="source" 
        position={Position.Right} 
        className="!bg-indigo-500 !border-indigo-400 !w-4 !h-4 !border-2 !rounded-full" 
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
        nodeType="Company"
      />
      
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 rounded-md">
            <Building2 className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="font-bold text-indigo-100 text-sm flex-1 line-clamp-1">
            {data.name}
          </h3>
        </div>
        
        {/* Status Badge */}
        <Badge className={`${statusColors[data.status]} text-xs px-2 py-1 rounded-md`}>
          {data.status}
        </Badge>
        
        {/* Company Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{data.industry}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{data.size}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{data.location}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(CompanyNode);
