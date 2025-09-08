import { useCallback, useState, useEffect, useRef } from "react";
import React from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  NodeMouseHandler,
  EdgeMouseHandler,
  type NodeChange,
  type EdgeChange,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ProjectNode from "./ProjectNode";
import TeamNode from "./TeamNode";
import TaskNode from "./TaskNode";
import FileNode from "./FileNode";
import CustomEdge from "./CustomEdge";
import { CanvasToolbar } from "./CanvasToolbar";
import { useProject } from "@/contexts/ProjectContext";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useCanvasPersistence } from "@/hooks/useCanvasPersistence";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Loader2, CheckCircle, AlertCircle, Save } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { AddProjectDialog } from "@/components/project/AddProjectDialog";

interface ProjectCanvasProps {
  onAddFileNode?: (fileData: any) => void;
}

const nodeTypes = {
  project: ProjectNode,
  team: TeamNode,
  task: TaskNode,
  file: FileNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

function ProjectCanvasFlow({ onAddFileNode }: ProjectCanvasProps) {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasFitted, setHasFitted] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const { setViewport, getViewport, fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentProject, setCurrentProject } = useProject();
  const { updateLastAccessed } = useProjectManagement();
  
  // Handler for project creation
  const handleProjectCreated = (project: any) => {
    setCurrentProject(project);
    setAddProjectOpen(false);
  };
  
  // Use canvas persistence for manual save only
  const { canvasState, updateCanvas, manualSave, saveStatus, isLoading } = useCanvasPersistence(currentProject?.id || null);
  const { nodes, edges } = canvasState;

  // Mark initial load complete once first lazy load finishes + auto-fit
  useEffect(() => {
    if (!isLoading && currentProject && !hasFitted && nodes.length > 0) {
      setHasLoadedOnce(true);
      setHasFitted(true);
      // Fit view to show all nodes after loading
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 100);
    } else if (!isLoading && currentProject && !hasFitted) {
      setHasLoadedOnce(true);
      setHasFitted(true);
    }
  }, [isLoading, currentProject, hasFitted, nodes.length, fitView]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualSave]);
  
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

  // Add new node (no auto-save)
  const addNewNode = useCallback((type: 'project' | 'team' | 'task' | 'file') => {
    const id = crypto.randomUUID();

    // Place new node at the center of current viewport
    const viewport = getViewport();
    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = (rect?.width || 0) / 2;
    const centerY = (rect?.height || 0) / 2;
    const position = {
      x: (centerX - viewport.x) / viewport.zoom,
      y: (centerY - viewport.y) / viewport.zoom,
    };

    const newNode: Node = {
      id,
      type,
      position,
      data: { ...getDefaultNodeData(type), isNew: true },
    };
    
    updateCanvas({ nodes: [...nodes, newNode] });
  }, [nodes, updateCanvas, getViewport]);

  // Add file node from sidebar
  const addFileNode = useCallback((fileData: any) => {
    const id = crypto.randomUUID();

    // Place new node at the center of current viewport
    const viewport = getViewport();
    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = (rect?.width || 0) / 2;
    const centerY = (rect?.height || 0) / 2;
    const position = {
      x: (centerX - viewport.x) / viewport.zoom,
      y: (centerY - viewport.y) / viewport.zoom,
    };

    const newNode: Node = {
      id,
      type: 'file',
      position,
      data: { ...fileData, isNew: true },
    };
    
    updateCanvas({ nodes: [...nodes, newNode] });
  }, [nodes, updateCanvas, getViewport]);

  // Expose addFileNode to parent component
  useEffect(() => {
    if (onAddFileNode) {
      (window as any).addFileNodeToCanvas = addFileNode;
    }
  }, [addFileNode, onAddFileNode]);

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

  // Handle node and edge changes (optimized)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    updateCanvas({ nodes: applyNodeChanges(changes, nodes) });
  }, [nodes, updateCanvas]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    updateCanvas({ edges: applyEdgeChanges(changes, edges) });
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
    setHasFitted(false);
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
      case 'file':
        return {
          title: 'File Container',
          files: []
        };
      default:
        return {};
    }
  };

  // Show loading overlay only during the initial load
  if (currentProject && isLoading && !hasLoadedOnce) {
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
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setAddProjectOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Project
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </CardHeader>
        </Card>
        <AddProjectDialog 
          open={addProjectOpen} 
          onOpenChange={setAddProjectOpen}
          onProjectCreated={handleProjectCreated}
        />
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
                  {saveStatus.hasUnsavedChanges && (
                    <span className="text-orange-500 ml-1">●</span>
                  )}
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
            {/* Manual Save Button */}
            <Button 
              onClick={() => manualSave()}
              disabled={saveStatus.isSaving || !saveStatus.hasUnsavedChanges}
              variant={saveStatus.hasUnsavedChanges ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saveStatus.isSaving ? 'Saving...' : 'Save'}
            </Button>
            
            {/* Unsaved Changes Indicator */}
            {saveStatus.hasUnsavedChanges && !saveStatus.isSaving && (
              <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-300">
                ● Unsaved changes
              </Badge>
            )}

            {/* Last saved indicator */}
            {saveStatus.lastSaved && !saveStatus.hasUnsavedChanges && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Saved {new Date(saveStatus.lastSaved).toLocaleTimeString()}
              </Badge>
            )}

            {/* Save error */}
            {saveStatus.error && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Save failed
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
          ref={containerRef}
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
          connectOnClick={false}
        >
          <Background 
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="hsl(var(--canvas-grid))"
          />
        </ReactFlow>
      </div>
      
      <AddProjectDialog 
        open={addProjectOpen} 
        onOpenChange={setAddProjectOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}

export function ProjectCanvas(props: ProjectCanvasProps = {}) {
  const { onAddFileNode } = props;
  
  // Handler for project creation
  const handleProjectCreated = (project: any) => {
    // This will be handled by the ProjectContext
  };

  return (
    <ReactFlowProvider>
      <ProjectCanvasFlow onAddFileNode={onAddFileNode} />
    </ReactFlowProvider>
  );
}