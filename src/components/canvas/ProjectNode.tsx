import { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ProjectEditDialog } from "./ProjectEditDialog";
import { NodeContextMenu } from "./ContextMenu";

interface ProjectNodeData {
  title: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  members: number;
  progress: number;
  priority: 'low' | 'medium' | 'high';
  isNew?: boolean;
}

interface ProjectNodeProps {
  data: ProjectNodeData;
  id: string;
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

function ProjectNode({ data, id }: ProjectNodeProps) {
  const { setNodes, setEdges } = useReactFlow();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleEditClick = () => {
    setShowEditDialog(true);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleSave = (updatedData: any) => {
    setNodes((nodes) => 
      nodes.map((node) => 
        node.id === id 
          ? { ...node, data: { ...updatedData, isNew: false } }
          : node
      )
    );
  };

  return (
    <NodeContextMenu 
      onEdit={handleEditClick} 
      onDelete={() => setShowDeleteDialog(true)}
      nodeType="Project"
    >
      <Card className={`w-64 bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-2 border-blue-500/30 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:border-blue-400/50 transition-all duration-300 relative group ${data.isNew ? 'new-node-animation' : ''}`}>
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-blue-500 !border-blue-400 !w-4 !h-4 !border-2" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-blue-500 !border-blue-400 !w-4 !h-4 !border-2" 
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
          nodeType="Project"
        />

        {/* Edit Dialog */}
        <ProjectEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          data={data}
          onSave={handleSave}
        />
        
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 
              className="font-bold text-blue-100 text-sm line-clamp-2 cursor-pointer hover:text-blue-200 transition-colors flex items-center gap-2" 
              onClick={handleTitleClick}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
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
    </NodeContextMenu>
  );
}

export default memo(ProjectNode);