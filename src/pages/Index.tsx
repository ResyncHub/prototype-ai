import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCanvas } from "@/components/canvas/ProjectCanvas";
import { useCallback, useState } from "react";
import { AddProjectDialog } from "@/components/project/AddProjectDialog";

const Index = () => {
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  
  const handleAddFileNode = useCallback((fileData: any) => {
    // This will be passed down to ProjectCanvas to create file nodes
    console.log('Adding file node with data:', fileData);
  }, []);

  const handleProjectCreated = useCallback((project: any) => {
    // This will be handled by the AppLayout/sidebar
    setAddProjectOpen(false);
  }, []);

  return (
    <AppLayout 
      onAddFileNode={handleAddFileNode}
      onProjectCreated={handleProjectCreated}
    >
      <div className="flex flex-col h-screen">
        {/* Main Canvas Area */}
        <div className="flex-1">
          <ProjectCanvas 
            onAddFileNode={handleAddFileNode}
            onCreateProject={() => setAddProjectOpen(true)}
          />
        </div>
      </div>
      
      <AddProjectDialog 
        open={addProjectOpen} 
        onOpenChange={setAddProjectOpen}
        onProjectCreated={handleProjectCreated}
      />
    </AppLayout>
  );
};

export default Index;
