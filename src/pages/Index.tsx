import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCanvas } from "@/components/canvas/ProjectCanvas";
import { Card } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Share, Download, Settings } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-foreground hover:bg-accent" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Project Canvas</h1>
              <p className="text-sm text-muted-foreground">Visualize and manage your projects</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Main Canvas Area */}
        <div className="flex-1">
          <ProjectCanvas />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
