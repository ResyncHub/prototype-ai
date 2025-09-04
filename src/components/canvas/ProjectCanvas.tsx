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
import { useCanvasLazyLoading } from "@/hooks/useCanvasLazyLoading";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Loader2, CheckCircle, AlertCircle, Activity, Database } from "lucide-react";
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
  const [showPerformanceInfo, setShowPerformanceInfo] = useState(false);
  const { setViewport, getViewport } = useReactFlow();
  const { currentProject } = useProject();
  const { updateLastAccessed } = useProjectManagement();
  
  // Use lazy loading for optimal performance
  const { 
    nodes: lazyNodes, 
    edges: lazyEdges, 
    isLoading: lazyLoading, 
    updateViewport: updateLazyViewport,
    debugInfo 
  } = useCanvasLazyLoading(currentProject?.id || null);

  // Use canvas persistence for saving changes
  const { updateCanvas, saveStatus } = useCanvasPersistence(currentProject?.id || null);
  
  // Combine nodes and edges from both sources
  const nodes = lazyNodes;
  const edges = lazyEdges;
  const isLoading = lazyLoading;
  
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

  // Handle viewport changes for lazy loading
  const onMove = useCallback((event: any, viewport: any) => {
    // Get canvas container size for viewport calculations
    const container = document.querySelector('.react-flow__viewport');
    const containerRect = container?.getBoundingClientRect();
    const width = containerRect?.width || 1200;
    const height = containerRect?.height || 800;
    
    updateLazyViewport(viewport, width, height);
  }, [updateLazyViewport]);

  // Add new node with immediate save
  const addNewNode = useCallback((type: 'project' | 'team' | 'task') => {
    const id = crypto.randomUUID();
    const viewport = getViewport();
    
    // Place new nodes in the center of current viewport
    const centerX = (-viewport.x / viewport.zoom) + (window.innerWidth / 2) / viewport.zoom;
    const centerY = (-viewport.y / viewport.zoom) + (window.innerHeight / 2) / viewport.zoom;
    
    const newNode: Node = {
      id,
      type,
      position: { 
        x: centerX + (Math.random() - 0.5) * 200, 
        y: centerY + (Math.random() - 0.5) * 200 
      },
      data: { ...getDefaultNodeData(type), isNew: true },
    };
    
    // Save to persistence system
    updateCanvas({ nodes: [...nodes, newNode], edges });
    
    // Refresh lazy loading to include new node
    setTimeout(() => {
      const container = document.querySelector('.react-flow__viewport');
      const containerRect = container?.getBoundingClientRect();
      const width = containerRect?.width || 1200;
      const height = containerRect?.height || 800;
      updateLazyViewport(viewport, width, height);
    }, 100);
  }, [nodes, edges, updateCanvas, getViewport, updateLazyViewport]);

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
          
          {/* Save Status and Performance Indicators */}
          <div className="flex items-center gap-2">
            {/* Performance Info Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPerformanceInfo(!showPerformanceInfo)}
              className="h-6 px-2"
            >
              <Activity className="h-3 w-3" />
            </Button>
            
            {/* Performance Info Display */}
            {showPerformanceInfo && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {debugInfo.loadedNodes}/{debugInfo.totalNodes} nodes
                </Badge>
                {debugInfo.queryTime > 0 && (
                  <Badge variant="outline">
                    {debugInfo.queryTime.toFixed(0)}ms
                  </Badge>
                )}
                {debugInfo.loadedChunks > 0 && (
                  <Badge variant="outline">
                    {debugInfo.loadedChunks} chunks
                  </Badge>
                )}
                {debugInfo.isSmallCanvas && (
                  <Badge variant="secondary">
                    Small canvas mode
                  </Badge>
                )}
              </div>
            )}

            {/* Loading indicator for lazy loading */}
            {isLoading && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading nodes...
              </Badge>
            )}

            {/* Save Status Indicators */}
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
          onMove={onMove}
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