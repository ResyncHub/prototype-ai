import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, useSidebar, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { FolderKanban, Plus, Layers, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AddProjectDialog } from "@/components/project/AddProjectDialog";
import { useProjects } from "@/hooks/useProjects";
import { useProject } from "@/contexts/ProjectContext";

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const { projects } = useProjects();
  const { setCurrentProject } = useProject();
  
  return (
    <Sidebar 
      className="border-sidebar-border bg-sidebar top-12 h-[calc(100svh-3rem)] group"
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SidebarContent className="py-3 px-2 group-data-[collapsible=icon]:px-1">
        <SidebarGroup className="group-data-[collapsible=icon]:p-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <Collapsible 
                open={projectsOpen} 
                onOpenChange={setProjectsOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                      tooltip="Projects"
                    >
                      <FolderKanban className="h-4 w-4 group-data-[collapsible=icon]:mx-auto" />
                      <span className="group-data-[collapsible=icon]:hidden">Projects</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          className="group-data-[collapsible=icon]:hidden"
                          onClick={() => setAddProjectOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Project</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton className="group-data-[collapsible=icon]:hidden">
                          <Layers className="h-4 w-4" />
                          <span>My Projects</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton className="group-data-[collapsible=icon]:hidden">
                          <Layers className="h-4 w-4" />
                          <span>Involvement</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AddProjectDialog 
        open={addProjectOpen} 
        onOpenChange={setAddProjectOpen}
        onProjectCreated={(project) => setCurrentProject(project)}
      />
    </Sidebar>
  );
}