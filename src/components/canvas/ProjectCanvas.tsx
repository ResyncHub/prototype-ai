import { useCallback, useState } from "react";
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ProjectNode from "./ProjectNode";
import TeamNode from "./TeamNode";
import TaskNode from "./TaskNode";
import { CanvasToolbar } from "./CanvasToolbar";

const nodeTypes = {
  project: ProjectNode,
  team: TeamNode,
  task: TaskNode,
};

const initialNodes: Node[] = [
  {
    id: 'project-1',
    type: 'project',
    position: { x: 200, y: 100 },
    data: {
      title: 'Website Redesign',
      status: 'active',
      members: 5,
      progress: 65,
      priority: 'high'
    },
  },
  {
    id: 'team-1',
    type: 'team',
    position: { x: 500, y: 200 },
    data: {
      name: 'Design Team',
      members: ['Alice', 'Bob', 'Carol'],
      role: 'UI/UX Design'
    },
  },
  {
    id: 'task-1',
    type: 'task',
    position: { x: 100, y: 300 },
    data: {
      title: 'Create wireframes',
      assignee: 'Alice',
      status: 'completed',
      dueDate: '2024-01-15'
    },
  },
  {
    id: 'task-2',
    type: 'task',
    position: { x: 400, y: 400 },
    data: {
      title: 'Develop components',
      assignee: 'Bob',
      status: 'in_progress',
      dueDate: '2024-01-20'
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'project-1',
    target: 'team-1',
    type: 'smoothstep',
    style: { stroke: 'hsl(var(--project-accent-light))', strokeWidth: 2 },
  },
  {
    id: 'e1-3',
    source: 'project-1',
    target: 'task-1',
    type: 'smoothstep',
    style: { stroke: 'hsl(var(--project-accent-light))', strokeWidth: 2 },
  },
  {
    id: 'e2-4',
    source: 'team-1',
    target: 'task-2',
    type: 'smoothstep',
    style: { stroke: 'hsl(var(--project-accent-light))', strokeWidth: 2 },
  },
];

export function ProjectCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNewNode = (type: 'project' | 'team' | 'task') => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 500 + 100, y: Math.random() * 400 + 100 },
      data: getDefaultNodeData(type),
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'project':
        return {
          title: 'New Project',
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
      <CanvasToolbar onAddNode={addNewNode} />
      
      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-canvas-background"
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Controls 
            className="bg-card border-border shadow-card"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)'
            }}
          />
          <MiniMap 
            className="bg-card border border-border shadow-card"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
            }}
            nodeStrokeColor="hsl(var(--project-accent))"
            nodeColor="hsl(var(--project-card))"
            nodeBorderRadius={8}
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