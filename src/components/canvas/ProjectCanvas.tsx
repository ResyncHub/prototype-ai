import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  NodeMouseHandler,
  EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ProjectNode from "./ProjectNode";
import TeamNode from "./TeamNode";
import TaskNode from "./TaskNode";
import CustomEdge from "./CustomEdge";
import { CanvasToolbar } from "./CanvasToolbar";
import { useProject } from "@/contexts/ProjectContext";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useCanvasPersistence } from "@/hooks/useCanvasPersistence";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

const nodeTypes = {
  project: ProjectNode,
  team: TeamNode,
  task: TaskNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

function ProjectCanvasFlow() {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const { setViewport } = useReactFlow();
  const { currentProject } = useProject();
  const { updateLastAccessed } = useProjectManagement();
  
  // Use canvas persistence hook
  const { canvasState, updateCanvas, isLoading, saveStatus } = useCanvasPersistence(currentProject?.id || null);
  const { nodes, edges } = canvasState;
  
  const nodeClassName = (node: Node) => node.type || 'default';
  
  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        id: crypto.randomUUID(),
        ...params,
        type: 'custom',
        style: { stroke: 'hsl(var(--project-accent-light))', strokeWidth: 2 },
      } as Edge;
      const newEdges = addEdge(edge, edges);
      updateCanvas({ edges: newEdges });
    },
    [edges, updateCanvas],
  );

  const addNewNode = (type: 'project' | 'team' | 'task') => {
    const id = crypto.randomUUID();
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 500 + 100, y: Math.random() * 400 + 100 },
      data: { ...getDefaultNodeData(type), isNew: true },
    };
    
    updateCanvas({ nodes: [...nodes, newNode] });
  };

  const deleteSelectedNodes = useCallback(() => {
    const newNodes = nodes.filter((node) => !selectedNodes.includes(node.id));
    const newEdges = edges.filter((edge) => 
      !selectedNodes.includes(edge.source) && 
      !selectedNodes.includes(edge.target)
    );
    updateCanvas({ nodes: newNodes, edges: newEdges });
    setSelectedNodes([]);
  }, [selectedNodes, nodes, edges, updateCanvas]);

  const deleteSelectedEdges = useCallback(() => {
    const newEdges = edges.filter((edge) => !selectedEdges.includes(edge.id));
    updateCanvas({ edges: newEdges });
    setSelectedEdges([]);
  }, [selectedEdges, edges, updateCanvas]);

  const clearCanvas = useCallback(() => {
    updateCanvas({ nodes: [], edges: [] });
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [updateCanvas]);

  const onSelectionChange = useCallback((params: any) => {
    setSelectedNodes(params.nodes.map((node: Node) => node.id));
    setSelectedEdges(params.edges.map((edge: Edge) => edge.id));
  }, []);

  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    // Context menu functionality can be added here
  }, []);

  const onEdgeContextMenu: EdgeMouseHandler = useCallback((event, edge) => {
    event.preventDefault();
    // Context menu functionality can be added here
  }, []);

  // Handle node and edge changes
  const onNodesChange = useCallback((changes: any) => {
    // Apply changes to current nodes
    const updatedNodes = nodes.map(node => {
      const change = changes.find((c: any) => c.id === node.id);
      if (!change) return node;
      
      switch (change.type) {
        case 'position':
          return change.position ? { ...node, position: change.position } : node;
        case 'dimensions':
          return change.dimensions ? { ...node, ...change.dimensions } : node;
        case 'remove':
          return null;
        default:
          return node;
      }
    }).filter(Boolean) as Node[];
    
    updateCanvas({ nodes: updatedNodes });
  }, [nodes, updateCanvas]);

  const onEdgesChange = useCallback((changes: any) => {
    const updatedEdges = edges.filter(edge => 
      !changes.some((c: any) => c.id === edge.id && c.type === 'remove')
    );
    updateCanvas({ edges: updatedEdges });
  }, [edges, updateCanvas]);

  // Update last accessed when project is selected
  useEffect(() => {
    if (currentProject?.id) {
      updateLastAccessed(currentProject.id);
    }
  }, [currentProject?.id, updateLastAccessed]);

  // Clear selections when switching projects
  useEffect(() => {
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [currentProject?.id]);

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'project':
        return {
          title: 'Start Project',
          status: 'planning',
          members: 0,
          progress: 0,
          priority: 'medium'
        };
      case 'team':
        return {
          name: 'New Team',
          members: [],
          role: 'Development'
        };
      case 'task':
        return {
          title: 'New Task',
          assignee: 'Unassigned',
          status: 'todo',
          dueDate: new Date().toISOString().split('T')[0]
        };
      default:
        return {};
    }
  };

  // Show loading state
  if (isLoading && currentProject) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-canvas-background">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-xl mb-2">Loading Canvas</CardTitle>
            <CardDescription>
              Loading your project canvas...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show empty state if no project is selected
  if (!currentProject) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-canvas-background">
        <Card className="max-w-lg mx-auto text-center shadow-lg">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Welcome to Your Workspace</CardTitle>
            <CardDescription className="text-base leading-relaxed mb-6">
              Create your first project to start building amazing things. Projects help you organize your work and collaborate with your team.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Project
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative flex flex-col">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-background px-4 py-2">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="flex items-center gap-2 font-medium">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentProject.color }}
                  />
                  {currentProject.name}
                </span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-muted-foreground">Canvas</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Save Status Indicator */}
          <div className="flex items-center gap-2">
            {saveStatus.isSaving && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </Badge>
            )}
            {saveStatus.lastSaved && !saveStatus.isSaving && !saveStatus.hasUnsavedChanges && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                All changes saved
              </Badge>
            )}
            {saveStatus.error && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Save failed
              </Badge>
            )}
            {saveStatus.hasUnsavedChanges && !saveStatus.isSaving && (
              <Badge variant="outline" className="flex items-center gap-1">
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        {/* Canvas Toolbar */}
        <CanvasToolbar 
          onAddNode={addNewNode} 
          onClearCanvas={clearCanvas}
          selectedCount={selectedNodes.length + selectedEdges.length}
        />
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-canvas-background"
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.1}
          maxZoom={2}
          multiSelectionKeyCode="Shift"
          deleteKeyCode={null}
          nodesDraggable={true}
          elementsSelectable={true}
          panOnDrag={[2]}
          zoomOnDoubleClick={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
        >
          <Background 
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="hsl(var(--canvas-grid))"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export function ProjectCanvas() {
  return (
    <ReactFlowProvider>
      <ProjectCanvasFlow />
    </ReactFlowProvider>
  );
}