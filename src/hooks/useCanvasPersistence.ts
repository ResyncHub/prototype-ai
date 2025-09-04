import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface SaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

// Helpers to ensure DB-friendly UUID ids for nodes and edges
const isUuid = (v: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);

function normalizeIds(state: CanvasState): { state: CanvasState; changed: boolean } {
  const idMap = new Map<string, string>();
  let changed = false;

  const nodes = state.nodes.map((n) => {
    let id = n.id;
    if (!isUuid(id)) {
      const newId = crypto.randomUUID();
      idMap.set(id, newId);
      id = newId;
      changed = true;
    }
    return { ...n, id } as Node;
  });

  const edges = state.edges.map((e) => {
    let id = e.id;
    if (!isUuid(id)) {
      id = crypto.randomUUID();
      changed = true;
    }
    const source = idMap.get(e.source) ?? e.source;
    const target = idMap.get(e.target) ?? e.target;
    if (source !== e.source || target !== e.target) changed = true;
    return { ...e, id, source, target } as Edge;
  });

  if (!changed) return { state, changed };
  return { state: { ...state, nodes, edges }, changed };
}

export function useCanvasPersistence(projectId: string | null) {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 0.8 }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null
  });

  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedStateRef = useRef<string>('');

  // Debounced save function
  const debouncedSave = useCallback(async (state: CanvasState) => {
    if (!projectId) return;

    const normalized = normalizeIds(state);
    const stateToPersist = normalized.state;
    const stateJson = JSON.stringify(stateToPersist);
    if (normalized.changed) {
      setCanvasState(stateToPersist);
    }
    if (stateJson === lastSavedStateRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus(prev => ({ ...prev, isSaving: true, error: null }));

      try {
        // Save canvas state - ensure single row per project by delete-then-insert
        await (supabase as any)
          .from('project_canvas')
          .delete()
          .eq('project_id', projectId);

        const { error: canvasError } = await (supabase as any)
          .from('project_canvas')
          .insert({
            project_id: projectId,
            canvas_data: {
              nodes: stateToPersist.nodes,
              edges: stateToPersist.edges,
              viewport: stateToPersist.viewport
            }
          });

        if (canvasError) throw canvasError;

        // Save individual nodes
        if (stateToPersist.nodes.length > 0) {
          const nodeData = stateToPersist.nodes.map(node => ({
            id: node.id,
            project_id: projectId,
            node_type: node.type || 'default',
            position_x: Math.round(node.position.x),
            position_y: Math.round(node.position.y),
            width: node.width || 200,
            height: node.height || 100,
            content: node.data || {},
            style: node.style || {}
          }));

          // Delete existing nodes for this project, then insert new ones
          await (supabase as any)
            .from('project_nodes')
            .delete()
            .eq('project_id', projectId);

          const { error: nodesError } = await (supabase as any)
            .from('project_nodes')
            .insert(nodeData);

          if (nodesError) throw nodesError;
        } else {
          // Clear all nodes if canvas is empty
          await (supabase as any)
            .from('project_nodes')
            .delete()
            .eq('project_id', projectId);
        }

        // Save connections
        if (stateToPersist.edges.length > 0) {
          const connectionData = stateToPersist.edges.map(edge => ({
            id: edge.id,
            project_id: projectId,
            from_node_id: edge.source,
            to_node_id: edge.target,
            connection_type: edge.type || 'default'
          }));

          // Delete existing connections for this project, then insert new ones
          await (supabase as any)
            .from('project_connections')
            .delete()
            .eq('project_id', projectId);

          const { error: connectionsError } = await (supabase as any)
            .from('project_connections')
            .insert(connectionData);

          if (connectionsError) throw connectionsError;
        } else {
          // Clear all connections if no edges exist
          await (supabase as any)
            .from('project_connections')
            .delete()
            .eq('project_id', projectId);
        }

        lastSavedStateRef.current = stateJson;
        setSaveStatus({
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
          error: null
        });

      } catch (error) {
        console.error('Failed to save canvas:', error);
        setSaveStatus(prev => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Failed to save canvas'
        }));
        
        toast({
          title: "Save Error",
          description: "Failed to save canvas changes. Please try again.",
          variant: "destructive"
        });
      }
    }, 2000); // 2 second debounce
  }, [projectId, toast]);

  // Load canvas state from Supabase
  const loadCanvas = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setSaveStatus(prev => ({ ...prev, error: null }));

    try {
      // Load canvas data - using type assertion for tables not in current types
      const { data: canvasData1, error: canvasError1 } = await (supabase as any)
        .from('project_canvas')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();

      let canvasRecord = canvasData1;
      if (canvasError1 && (canvasError1 as any).code === 'PGRST116') {
        const { data: canvasList, error: canvasListError } = await (supabase as any)
          .from('project_canvas')
          .select('canvas_data')
          .eq('project_id', projectId)
          .limit(1);
        if (canvasListError) throw canvasListError;
        canvasRecord = canvasList?.[0] ?? null;
      } else if (canvasError1) {
        throw canvasError1;
      }

      // Load individual nodes
      const { data: nodesData, error: nodesError } = await (supabase as any)
        .from('project_nodes')
        .select('*')
        .eq('project_id', projectId);

      if (nodesError) throw nodesError;

      // Load connections
      const { data: connectionsData, error: connectionsError } = await (supabase as any)
        .from('project_connections')
        .select('*')
        .eq('project_id', projectId);

      if (connectionsError) throw connectionsError;

      // Transform data back to React Flow format
      const nodes: Node[] = (nodesData || []).map(node => ({
        id: node.id,
        type: node.node_type,
        position: { x: node.position_x, y: node.position_y },
        data: node.content || {},
        style: node.style || {},
        width: node.width || undefined,
        height: node.height || undefined
      }));

      const edges: Edge[] = (connectionsData || []).map(connection => ({
        id: connection.id,
        source: connection.from_node_id,
        target: connection.to_node_id,
        type: connection.connection_type || 'custom',
        style: { stroke: 'hsl(var(--project-accent-light))', strokeWidth: 2 }
      }));

      const viewport = canvasRecord?.canvas_data?.viewport || { x: 0, y: 0, zoom: 0.8 };

      const newState: CanvasState = { nodes, edges, viewport };
      setCanvasState(newState);
      lastSavedStateRef.current = JSON.stringify(newState);

      setSaveStatus({
        isSaving: false,
        lastSaved: null,
        hasUnsavedChanges: false,
        error: null
      });

    } catch (error) {
      console.error('Failed to load canvas:', error);
      setSaveStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load canvas'
      }));
      
      toast({
        title: "Load Error",
        description: "Failed to load canvas. Using empty canvas.",
        variant: "destructive"
      });

      // Set empty state on error
      setCanvasState({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.8 } });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update canvas state and trigger save
  const updateCanvas = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => {
      const newState = { ...prev, ...updates };
      setSaveStatus(prevStatus => ({ ...prevStatus, hasUnsavedChanges: true }));
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  // Load canvas when project changes
  useEffect(() => {
    if (projectId) {
      loadCanvas(projectId);
    } else {
      setCanvasState({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 0.8 } });
      setSaveStatus({
        isSaving: false,
        lastSaved: null,
        hasUnsavedChanges: false,
        error: null
      });
    }
  }, [projectId, loadCanvas]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    canvasState,
    updateCanvas,
    isLoading,
    saveStatus,
    loadCanvas: () => projectId ? loadCanvas(projectId) : Promise.resolve()
  };
}