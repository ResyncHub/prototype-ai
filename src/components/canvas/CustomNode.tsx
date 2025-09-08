import { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, X, Palette } from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { NodeContextMenu } from "./ContextMenu";
import { CustomNodeEditDialog } from "./CustomNodeEditDialog";

interface CustomNodeData extends Record<string, unknown> {
  title: string;
  description?: string;
  content?: string;
  tags?: string[];
  color?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'draft' | 'active' | 'completed' | 'archived';
  isNew?: boolean;
}

interface CustomNodeProps {
  data: CustomNodeData;
  id: string;
}

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', 
  high: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  critical: 'bg-red-500/20 text-red-300 border border-red-500/30'
};

const statusColors = {
  draft: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  active: 'bg-green-500/20 text-green-300 border border-green-500/30',
  completed: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  archived: 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
};

function CustomNode({ data, id }: CustomNodeProps) {
  const { setNodes, setEdges, updateNode } = useReactFlow();
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleSave = (updatedData: CustomNodeData) => {
    updateNode(id, { data: updatedData });
    setShowEditDialog(false);
  };

  const gradientColor = data.color || 'purple';
  const gradientClass = `bg-gradient-to-br from-${gradientColor}-950/50 to-${gradientColor}-900/30 border-2 border-${gradientColor}-500/30 shadow-lg shadow-${gradientColor}-500/20 hover:shadow-${gradientColor}-500/40 hover:border-${gradientColor}-400/50`;

  return (
    <NodeContextMenu 
      onEdit={() => setShowEditDialog(true)}
      onDelete={() => setShowDeleteDialog(true)}
      nodeType="Custom Node"
    >
      <Card className={`w-56 ${gradientClass} transition-all duration-300 relative group rounded-xl ${data.isNew ? 'new-custom-animation' : ''}`}>
        <Handle 
          type="target" 
          position={Position.Left} 
          className={`!bg-${gradientColor}-500 !border-${gradientColor}-400 !w-4 !h-4 !border-2 !rounded-full`}
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className={`!bg-${gradientColor}-500 !border-${gradientColor}-400 !w-4 !h-4 !border-2 !rounded-full`}
        />
        
        {/* Action Buttons */}
        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            className="nodrag h-6 w-6 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="nodrag h-6 w-6 p-0 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={deleteNode}
          title={data.title}
          nodeType="Custom Node"
        />

        {/* Edit Dialog */}
        <CustomNodeEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          data={data}
          onSave={handleSave}
        />
        
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className={`p-1.5 bg-${gradientColor}-500/20 rounded-md`}>
              <Palette className={`h-4 w-4 text-${gradientColor}-400`} />
            </div>
            <h3 className={`font-bold text-${gradientColor}-100 text-sm flex-1 line-clamp-2`}>
              {data.title}
            </h3>
          </div>
          
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            {data.status && (
              <Badge className={`${statusColors[data.status]} text-xs px-2 py-1 rounded-md`}>
                {data.status}
              </Badge>
            )}
            {data.priority && (
              <Badge className={`${priorityColors[data.priority]} text-xs px-2 py-1 rounded-md`}>
                {data.priority}
              </Badge>
            )}
          </div>
          
          {/* Description */}
          {data.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {data.description}
            </p>
          )}
          
          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0 rounded">
                  {tag}
                </Badge>
              ))}
              {data.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0 rounded">
                  +{data.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Content Preview */}
          {data.content && (
            <div className="text-xs text-muted-foreground bg-black/20 rounded p-2">
              <div className="line-clamp-2">{data.content}</div>
            </div>
          )}
        </div>
      </Card>
    </NodeContextMenu>
  );
}

export default memo(CustomNode);