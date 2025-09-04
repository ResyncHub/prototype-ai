import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Node, Edge, Viewport } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ViewportBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface NodeChunk {
  id: string;
  nodes: Node[];
  bounds: ViewportBounds;
  loaded: boolean;
  loading: boolean;
}

interface LazyLoadingState {
  loadedNodes: Node[];
  loadedEdges: Edge[];
  chunks: Map<string, NodeChunk>;
  isLoading: boolean;
  performanceMetrics: {
    totalNodes: number;
    loadedNodes: number;
    queryTime: number;
    memoryUsage: number;
  };
}

const CHUNK_SIZE = 75; // Load nodes in chunks of 75
const VIEWPORT_BUFFER = 0.2; // 20% buffer around viewport
const MAX_LOADED_CHUNKS = 12; // Maximum chunks to keep in memory
const SMALL_CANVAS_THRESHOLD = 50; // Load all nodes if total < 50

export function useCanvasLazyLoading(projectId: string | null) {
  const [state, setState] = useState<LazyLoadingState>({
    loadedNodes: [],
    loadedEdges: [],
    chunks: new Map(),
    isLoading: false,
    performanceMetrics: {
      totalNodes: 0,
      loadedNodes: 0,
      queryTime: 0,
      memoryUsage: 0
    }
  });

  const { toast } = useToast();
  const currentViewportRef = useRef<ViewportBounds>({ left: -500, right: 500, top: -400, bottom: 400 });
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate viewport bounds from React Flow viewport
  const calculateViewportBounds = useCallback((viewport: Viewport, canvasWidth: number, canvasHeight: number): ViewportBounds => {
    const { x, y, zoom } = viewport;
    
    // Transform screen coordinates to canvas coordinates
    const left = -x / zoom - (canvasWidth * VIEWPORT_BUFFER) / zoom;
    const right = (-x + canvasWidth) / zoom + (canvasWidth * VIEWPORT_BUFFER) / zoom;
    const top = -y / zoom - (canvasHeight * VIEWPORT_BUFFER) / zoom;
    const bottom = (-y + canvasHeight) / zoom + (canvasHeight * VIEWPORT_BUFFER) / zoom;

    return { left, right, top, bottom };
  }, []);

  // Generate chunk ID from bounds
  const getChunkId = useCallback((bounds: ViewportBounds): string => {
    const chunkX = Math.floor(bounds.left / 1000);
    const chunkY = Math.floor(bounds.top / 1000);
    return `chunk_${chunkX}_${chunkY}`;
  }, []);

  // Check if node intersects with viewport bounds
  const nodeIntersectsViewport = useCallback((node: any, bounds: ViewportBounds): boolean => {
    const nodeLeft = node.position_x;
    const nodeRight = node.position_x + (node.width || 200);
    const nodeTop = node.position_y;
    const nodeBottom = node.position_y + (node.height || 100);

    return !(nodeRight < bounds.left || 
             nodeLeft > bounds.right || 
             nodeBottom < bounds.top || 
             nodeTop > bounds.bottom);
  }, []);

  // Get total node count for performance decision
  const getTotalNodeCount = useCallback(async (projectId: string): Promise<number> => {
    const { count, error } = await (supabase as any)
      .from('project_nodes')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (error) {
      console.error('Error getting node count:', error);
      return 0;
    }
    
    return count || 0;
  }, []);

  // Load nodes for specific viewport bounds
  const loadNodesInViewport = useCallback(async (
    projectId: string, 
    bounds: ViewportBounds
  ): Promise<{ nodes: Node[]; queryTime: number }> => {
    const startTime = performance.now();
    
    console.log('DEBUG: Loading nodes for viewport:', bounds);
    
    const { data: nodesData, error } = await (supabase as any)
      .from('project_nodes')
      .select('*')
      .eq('project_id', projectId)
      .gte('position_x', Math.floor(bounds.left))
      .lte('position_x', Math.ceil(bounds.right))
      .gte('position_y', Math.floor(bounds.top))
      .lte('position_y', Math.ceil(bounds.bottom))
      .limit(CHUNK_SIZE);

    if (error) {
      console.error('Error loading viewport nodes:', error);
      throw error;
    }

    const queryTime = performance.now() - startTime;
    
    // Transform to React Flow format
    const nodes: Node[] = (nodesData || []).map(node => ({
      id: node.id,
      type: node.node_type,
      position: { x: node.position_x, y: node.position_y },
      data: node.content || {},
      style: node.style || {},
      width: node.width || undefined,
      height: node.height || undefined
    }));

    console.log(`DEBUG: Loaded ${nodes.length} nodes in ${queryTime.toFixed(2)}ms`);
    
    return { nodes, queryTime };
  }, []);

  // Load all nodes for small canvases
  const loadAllNodes = useCallback(async (projectId: string): Promise<{ nodes: Node[]; edges: Edge[]; queryTime: number }> => {
    const startTime = performance.now();
    
    console.log('DEBUG: Loading all nodes (small canvas)');
    
    // Load all nodes
    const { data: nodesData, error: nodesError } = await (supabase as any)
      .from('project_nodes')
      .select('*')
      .eq('project_id', projectId);

    if (nodesError) throw nodesError;

    // Load all edges
    const { data: edgesData, error: edgesError } = await (supabase as any)
      .from('project_connections')
      .select('*')
      .eq('project_id', projectId);

    if (edgesError) throw edgesError;

    const queryTime = performance.now() - startTime;

    // Transform data
    const nodes: Node[] = (nodesData || []).map(node => ({
      id: node.id,
      type: node.node_type,
      position: { x: node.position_x, y: node.position_y },
      data: node.content || {},
      style: node.style || {},
      width: node.width || undefined,
      height: node.height || undefined
    }));

    const edges: Edge[] = (edgesData || []).map(connection => ({
      id: connection.id,
      source: connection.from_node_id,
      target: connection.to_node_id,
      type: connection.connection_type || 'custom',
      style: { stroke: 'hsl(var(--project-accent-light))', strokeWidth: 2 }
    }));

    console.log(`DEBUG: Loaded all ${nodes.length} nodes and ${edges.length} edges in ${queryTime.toFixed(2)}ms`);
    
    return { nodes, edges, queryTime };
  }, []);

  // Load edges for currently loaded nodes
  const loadEdgesForNodes = useCallback(async (projectId: string, nodeIds: string[]): Promise<Edge[]> => {
    if (nodeIds.length === 0) return [];
    
    const { data: edgesData, error } = await (supabase as any)
      .from('project_connections')
      .select('*')
      .eq('project_id', projectId)
      .or(`from_node_id.in.(${nodeIds.join(',')}),to_node_id.in.(${nodeIds.join(',')})`);

    if (error) {
      console.error('Error loading edges:', error);
      return [];
    }

    return (edgesData || []).map(connection => ({
      id: connection.id,
      source: connection.from_node_id,
      target: connection.to_node_id,
      type: connection.connection_type || 'custom',
      style: { stroke: 'hsl(var(--project-accent-light))', strokeWidth: 2 }
    }));
  }, []);

  // Memory management - remove distant chunks
  const cleanupDistantChunks = useCallback((currentBounds: ViewportBounds) => {
    setState(prev => {
      const newChunks = new Map(prev.chunks);
      const chunksToRemove: string[] = [];

      // Calculate distance from current viewport center
      const centerX = (currentBounds.left + currentBounds.right) / 2;
      const centerY = (currentBounds.top + currentBounds.bottom) / 2;

      newChunks.forEach((chunk, chunkId) => {
        const chunkCenterX = (chunk.bounds.left + chunk.bounds.right) / 2;
        const chunkCenterY = (chunk.bounds.top + chunk.bounds.bottom) / 2;
        
        const distance = Math.sqrt(
          Math.pow(centerX - chunkCenterX, 2) + 
          Math.pow(centerY - chunkCenterY, 2)
        );

        // Remove chunks that are too far (more than 3000px away)
        if (distance > 3000) {
          chunksToRemove.push(chunkId);
        }
      });

      // Keep only the most recent chunks if we have too many
      if (newChunks.size > MAX_LOADED_CHUNKS) {
        const chunkArray = Array.from(newChunks.entries())
          .sort((a, b) => {
            const distanceA = Math.sqrt(
              Math.pow(centerX - (a[1].bounds.left + a[1].bounds.right) / 2, 2) + 
              Math.pow(centerY - (a[1].bounds.top + a[1].bounds.bottom) / 2, 2)
            );
            const distanceB = Math.sqrt(
              Math.pow(centerX - (b[1].bounds.left + b[1].bounds.right) / 2, 2) + 
              Math.pow(centerY - (b[1].bounds.top + b[1].bounds.bottom) / 2, 2)
            );
            return distanceA - distanceB;
          });

        // Keep only the closest chunks
        chunkArray.slice(MAX_LOADED_CHUNKS).forEach(([chunkId]) => {
          chunksToRemove.push(chunkId);
        });
      }

      // Remove distant chunks
      chunksToRemove.forEach(chunkId => newChunks.delete(chunkId));

      if (chunksToRemove.length > 0) {
        console.log(`DEBUG: Cleaned up ${chunksToRemove.length} distant chunks`);
      }

      return { ...prev, chunks: newChunks };
    });
  }, []);

  // Main function to update viewport and load nodes
  const updateViewport = useCallback(async (
    viewport: Viewport,
    canvasWidth: number = 1200,
    canvasHeight: number = 800
  ) => {
    if (!projectId) return;

    const bounds = calculateViewportBounds(viewport, canvasWidth, canvasHeight);
    currentViewportRef.current = bounds;

    console.log('DEBUG: Viewport updated:', bounds);

    // Clear existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Debounce loading to avoid excessive queries during fast panning
    loadingTimeoutRef.current = setTimeout(async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));

        // Check if this is a small canvas
        const totalNodes = await getTotalNodeCount(projectId);
        
        setState(prev => ({
          ...prev,
          performanceMetrics: { ...prev.performanceMetrics, totalNodes }
        }));

        if (totalNodes <= SMALL_CANVAS_THRESHOLD) {
          // Load all nodes for small canvases
          const { nodes, edges, queryTime } = await loadAllNodes(projectId);
          
          setState(prev => ({
            ...prev,
            loadedNodes: nodes,
            loadedEdges: edges,
            isLoading: false,
            performanceMetrics: {
              ...prev.performanceMetrics,
              loadedNodes: nodes.length,
              queryTime,
              memoryUsage: nodes.length + edges.length
            }
          }));
          return;
        }

        // For large canvases, use lazy loading
        const chunkId = getChunkId(bounds);
        
        setState(prev => {
          const existingChunk = prev.chunks.get(chunkId);
          
          if (existingChunk?.loaded) {
            console.log('DEBUG: Using cached chunk:', chunkId);
            return prev;
          }

          // Mark chunk as loading
          const newChunks = new Map(prev.chunks);
          newChunks.set(chunkId, {
            id: chunkId,
            nodes: [],
            bounds,
            loaded: false,
            loading: true
          });

          return { ...prev, chunks: newChunks };
        });

        // Load nodes for this viewport
        const { nodes: newNodes, queryTime } = await loadNodesInViewport(projectId, bounds);
        
        // Update chunk with loaded nodes
        setState(prev => {
          const newChunks = new Map(prev.chunks);
          newChunks.set(chunkId, {
            id: chunkId,
            nodes: newNodes,
            bounds,
            loaded: true,
            loading: false
          });

          // Collect all loaded nodes from all chunks
          const allLoadedNodes: Node[] = [];
          newChunks.forEach(chunk => {
            if (chunk.loaded) {
              allLoadedNodes.push(...chunk.nodes);
            }
          });

          // Remove duplicates (nodes might appear in multiple chunks)
          const uniqueNodes = allLoadedNodes.filter((node, index, array) => 
            array.findIndex(n => n.id === node.id) === index
          );

          return {
            ...prev,
            loadedNodes: uniqueNodes,
            chunks: newChunks,
            performanceMetrics: {
              ...prev.performanceMetrics,
              loadedNodes: uniqueNodes.length,
              queryTime,
              memoryUsage: uniqueNodes.length
            }
          };
        });

        // Load edges for the currently visible nodes
        const allNodeIds = state.loadedNodes.map(n => n.id);
        if (allNodeIds.length > 0) {
          const edges = await loadEdgesForNodes(projectId, allNodeIds);
          setState(prev => ({
            ...prev,
            loadedEdges: edges,
            performanceMetrics: {
              ...prev.performanceMetrics,
              memoryUsage: prev.performanceMetrics.memoryUsage + edges.length
            }
          }));
        }

        // Cleanup distant chunks
        cleanupDistantChunks(bounds);

      } catch (error) {
        console.error('Error loading viewport:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load canvas content. Please try refreshing.",
          variant: "destructive"
        });
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }, 300); // 300ms debounce

  }, [projectId, calculateViewportBounds, getTotalNodeCount, getChunkId, loadAllNodes, loadNodesInViewport, loadEdgesForNodes, cleanupDistantChunks, toast, state.loadedNodes]);

  // Initialize loading when project changes
  useEffect(() => {
    if (projectId) {
      // Start with default viewport
      updateViewport({ x: 0, y: 0, zoom: 0.8 });
    } else {
      setState({
        loadedNodes: [],
        loadedEdges: [],
        chunks: new Map(),
        isLoading: false,
        performanceMetrics: {
          totalNodes: 0,
          loadedNodes: 0,
          queryTime: 0,
          memoryUsage: 0
        }
      });
    }
  }, [projectId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Performance debug info
  const debugInfo = useMemo(() => ({
    totalNodes: state.performanceMetrics.totalNodes,
    loadedNodes: state.performanceMetrics.loadedNodes,
    loadedChunks: state.chunks.size,
    queryTime: state.performanceMetrics.queryTime,
    memoryUsage: state.performanceMetrics.memoryUsage,
    isSmallCanvas: state.performanceMetrics.totalNodes <= SMALL_CANVAS_THRESHOLD
  }), [state]);

  return {
    nodes: state.loadedNodes,
    edges: state.loadedEdges,
    isLoading: state.isLoading,
    updateViewport,
    debugInfo
  };
}
