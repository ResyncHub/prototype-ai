import { useCallback, useState, useEffect } from "react";
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

  return (
    <div className="h-full w-full relative">
      <CanvasToolbar 
        onAddNode={addNewNode} 
        onClearCanvas={clearCanvas}
        selectedCount={selectedNodes.length + selectedEdges.length}
      />
      
      <div className="h-full">
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
          <Controls 
            className="bg-card border-border shadow-card"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)'
            }}
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <MiniMap 
            className="bg-card border border-border shadow-card !bottom-4 !left-4 !top-auto !right-auto"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              width: '150px',
              height: '100px'
            }}
            nodeStrokeColor="hsl(var(--project-accent))"
            nodeColor="hsl(var(--project-card))"
            nodeBorderRadius={8}
            zoomable={true}
            pannable={true}
          />
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