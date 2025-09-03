import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { FolderKanban, Plus, Settings, ChevronRight, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AddProjectDialog } from "@/components/project/AddProjectDialog";
import { ProjectSettingsDialog } from "@/components/project/ProjectSettingsDialog";
import { useProjects } from "@/hooks/useProjects";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { projects, loading, refetch } = useProjects();
  const { currentProject, setCurrentProject } = useProject();
  const { user } = useAuth();
  
  const handleProjectCreated = (project: any) => {
    setCurrentProject(project);
    refetch();
  };

  const handleProjectUpdated = (project: any) => {
    setCurrentProject(project);
    refetch();
  };

  const handleProjectDeleted = (projectId: string) => {
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
    refetch();
  };

  const handleProjectSelect = (project: any) => {
    setCurrentProject(project);
  };

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
                      
                      {loading ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton className="group-data-[collapsible=icon]:hidden opacity-50">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : projects.length === 0 ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton className="group-data-[collapsible=icon]:hidden opacity-50 cursor-default">
                            <FileText className="h-4 w-4" />
                            <span className="text-muted-foreground">No projects yet</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : (
                        <>
                          {projects.map((project) => (
                            <SidebarMenuSubItem key={project.id}>
                              <SidebarMenuSubButton 
                                className={cn(
                                  "group-data-[collapsible=icon]:hidden group justify-between",
                                  currentProject?.id === project.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                                )}
                                onClick={() => handleProjectSelect(project)}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{project.name}</span>
                                </div>
                                {currentProject?.id === project.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSettingsOpen(true);
                                    }}
                                  >
                                    <Settings className="h-3 w-3" />
                                  </Button>
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </>
                      )}
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
        onProjectCreated={handleProjectCreated}
      />
      
      <ProjectSettingsDialog 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        project={currentProject}
        onProjectUpdated={handleProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
      />
    </Sidebar>
  );
}