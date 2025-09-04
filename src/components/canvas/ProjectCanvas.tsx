import { useCallback, useState, useEffect, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
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
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const { getNodes, getEdges } = useReactFlow();
  const { currentProject } = useProject();
  const { updateLastAccessed } = useProjectManagement();
  
  const nodeClassName = (node: Node) => node.type || 'default';
  
  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'custom',
        style: { stroke: 'hsl(var(--project-accent-light))', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  const addNewNode = (type: 'project' | 'team' | 'task') => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 500 + 100, y: Math.random() * 400 + 100 },
      data: { ...getDefaultNodeData(type), isNew: true },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
    setEdges((eds) => 
      eds.filter((edge) => 
        !selectedNodes.includes(edge.source) && 
        !selectedNodes.includes(edge.target)
      )
    );
    setSelectedNodes([]);
  }, [selectedNodes, setNodes, setEdges]);

  const deleteSelectedEdges = useCallback(() => {
    setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge.id)));
    setSelectedEdges([]);
  }, [selectedEdges, setEdges]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [setNodes, setEdges]);

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

  // Update last accessed when project is selected
  useEffect(() => {
    if (currentProject?.id) {
      updateLastAccessed(currentProject.id);
    }
  }, [currentProject?.id, updateLastAccessed]);

  // Persist canvas state per project in localStorage
  const storageKey = useMemo(() => currentProject?.id ? `canvas:${currentProject.id}` : null, [currentProject?.id]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setNodes(parsed.nodes || []);
        setEdges(parsed.edges || []);
      } else {
        setNodes([]);
        setEdges([]);
      }
    } catch (e) {
      console.error('Failed to load canvas state', e);
      setNodes([]);
      setEdges([]);
    }
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [storageKey, setNodes, setEdges]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const payload = JSON.stringify({ nodes, edges });
      localStorage.setItem(storageKey, payload);
    } catch (e) {
      console.error('Failed to save canvas state', e);
    }
  }, [nodes, edges, storageKey]);

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
      </div>

      {/* Canvas Toolbar */}
      <CanvasToolbar 
        onAddNode={addNewNode} 
        onClearCanvas={clearCanvas}
        selectedCount={selectedNodes.length + selectedEdges.length}
      />
      
      {/* React Flow Canvas */}
      <div className="flex-1">
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