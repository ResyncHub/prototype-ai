import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCanvas } from "@/components/canvas/ProjectCanvas";
import { useCallback } from "react";

const Index = () => {
  const handleAddFileNode = useCallback((fileData: any) => {
    // This will be passed down to ProjectCanvas to create file nodes
    console.log('Adding file node with data:', fileData);
  }, []);

  return (
    <AppLayout onAddFileNode={handleAddFileNode}>
      <div className="flex flex-col h-screen">
        {/* Main Canvas Area */}
        <div className="flex-1">
          <ProjectCanvas onAddFileNode={handleAddFileNode} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
