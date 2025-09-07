import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopNavigation } from "./TopNavigation";

interface AppLayoutProps {
  children: React.ReactNode;
  onAddFileNode?: (fileData: any) => void;
}

export function AppLayout({ children, onAddFileNode }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex flex-col w-full bg-canvas-background">
        <TopNavigation />
        <div className="flex flex-1">
          <AppSidebar onAddFileNode={onAddFileNode} />
          <SidebarInset className="flex-1">
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}