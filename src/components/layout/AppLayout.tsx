import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopNavigation } from "./TopNavigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-canvas-background">
        <TopNavigation />
        <div className="flex flex-1">
          <AppSidebar />
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