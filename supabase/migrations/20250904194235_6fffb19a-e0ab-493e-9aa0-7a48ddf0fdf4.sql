-- Add database indexes for position-based queries to optimize lazy loading performance
-- These indexes will significantly speed up viewport-based node filtering

-- Index for position_x queries (used in viewport filtering)
CREATE INDEX IF NOT EXISTS idx_project_nodes_position_x 
ON project_nodes (project_id, position_x);

-- Index for position_y queries (used in viewport filtering)
CREATE INDEX IF NOT EXISTS idx_project_nodes_position_y 
ON project_nodes (project_id, position_y);

-- Composite index for position-based queries with project_id
-- This is the most important index for lazy loading performance
CREATE INDEX IF NOT EXISTS idx_project_nodes_position_bounds 
ON project_nodes (project_id, position_x, position_y);

-- Index for project_connections table to optimize edge loading
CREATE INDEX IF NOT EXISTS idx_project_connections_nodes 
ON project_connections (project_id, from_node_id, to_node_id);

-- Index for faster canvas data retrieval
CREATE INDEX IF NOT EXISTS idx_project_canvas_project_id 
ON project_canvas (project_id);