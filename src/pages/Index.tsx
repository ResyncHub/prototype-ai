import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCanvas } from "@/components/canvas/ProjectCanvas";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Main Canvas Area */}
        <div className="flex-1">
          <ProjectCanvas />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
