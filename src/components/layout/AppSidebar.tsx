import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { FolderKanban, Plus, Settings, ChevronRight, FileText, Loader2, Clock, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AddProjectDialog } from "@/components/project/AddProjectDialog";
import { ProjectSettingsDialog } from "@/components/project/ProjectSettingsDialog";
import { ProjectSearchBar } from "@/components/project/ProjectSearchBar";
import { FilesTab } from "@/components/files/FilesTab";
import { useProjects } from "@/hooks/useProjects";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AppSidebarProps {
  onAddFileNode?: (fileData: any) => void;
  onProjectCreated?: (project: any) => void;
}

export function AppSidebar({ onAddFileNode, onProjectCreated: externalOnProjectCreated }: AppSidebarProps) {
  const { open, setOpen } = useSidebar();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const { projects, loading, refetch } = useProjects();
  const { updateLastAccessed, getRecentProjects } = useProjectManagement();
  const { currentProject, setCurrentProject } = useProject();
  const { user } = useAuth();
  
  const handleProjectCreated = (project: any) => {
    setCurrentProject(project);
    refetch();
    externalOnProjectCreated?.(project);
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

  const handleProjectSelect = async (project: any) => {
    setCurrentProject(project);
    await updateLastAccessed(project.id);
    // Real-time subscription will automatically update the list
  };


  // Load recent projects
  useEffect(() => {
    const loadRecents = async () => {
      const recents = await getRecentProjects(5);
      setRecentProjects(recents);
    };
    
    if (projects.length > 0) {
      loadRecents();
    }
  }, [projects, getRecentProjects]);

  // Initialize search results
  useEffect(() => {
    setSearchResults(projects);
  }, [projects]);

  const displayProjects = searchResults.length > 0 ? searchResults : projects;

  return (
    <Sidebar 
      className="border-sidebar-border bg-sidebar top-12 h-[calc(100svh-3rem)] group"
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={(e) => {
        const next = e.relatedTarget as HTMLElement | null;
        // Don't collapse when moving into Radix dropdown content
        if (next && next instanceof HTMLElement && next.closest('[data-radix-popper-content-wrapper]')) return;
        setOpen(false);
      }}
    >
      <SidebarContent className="py-3 px-2 group-data-[collapsible=icon]:px-1">
        <SidebarGroup className="group-data-[collapsible=icon]:p-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Recent Projects Section */}
              {recentProjects.length > 0 && (
                <Collapsible 
                  open={recentOpen} 
                  onOpenChange={setRecentOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                        tooltip="Recent Projects"
                      >
                        <Clock className="h-4 w-4 group-data-[collapsible=icon]:mx-auto" />
                        <span className="group-data-[collapsible=icon]:hidden">Recent</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {recentProjects.slice(0, 5).map((project) => (
                          <SidebarMenuSubItem key={`recent-${project.id}`}>
                            <SidebarMenuSubButton 
                              className={cn(
                                "group-data-[collapsible=icon]:hidden group justify-between",
                                currentProject?.id === project.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                              )}
                              onClick={() => handleProjectSelect(project)}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: project.color }}
                                />
                                <span className="truncate">{project.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(project.last_accessed_at), 'MMM dd')}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Files Section */}
              {currentProject && (
                <Collapsible 
                  open={filesOpen} 
                  onOpenChange={setFilesOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                        tooltip="Project Files"
                      >
                        <FileText className="h-4 w-4 group-data-[collapsible=icon]:mx-auto" />
                        <span className="group-data-[collapsible=icon]:hidden">Files</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="group-data-[collapsible=icon]:hidden">
                        <FilesTab onAddFileNode={onAddFileNode} />
                      </div>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* All Projects Section */}
              <Collapsible
                open={projectsOpen} 
                onOpenChange={setProjectsOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                      tooltip="All Projects"
                    >
                      <FolderKanban className="h-4 w-4 group-data-[collapsible=icon]:mx-auto" />
                      <span className="group-data-[collapsible=icon]:hidden">All Projects</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* Add Project Button */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          className="group-data-[collapsible=icon]:hidden text-primary hover:bg-primary/10"
                          onClick={() => setAddProjectOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Project</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Search Bar */}
                      {projects.length > 3 && (
                        <SidebarMenuSubItem>
                          <div className="group-data-[collapsible=icon]:hidden px-2 py-1">
                            <ProjectSearchBar 
                              allProjects={projects}
                              onSearchResults={setSearchResults}
                              className="w-full"
                            />
                          </div>
                        </SidebarMenuSubItem>
                      )}
                      
                      {loading ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton className="group-data-[collapsible=icon]:hidden opacity-50">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : displayProjects.length === 0 ? (
                        <SidebarMenuSubItem>
                          <div className="group-data-[collapsible=icon]:hidden px-2 py-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
                              <div className="text-sm text-muted-foreground">
                                {searchResults.length === 0 && projects.length > 0 
                                  ? "No matching projects" 
                                  : "Create your first project to get started"
                                }
                              </div>
                              {searchResults.length === 0 && projects.length === 0 && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setAddProjectOpen(true)}
                                  className="mt-2"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Project
                                </Button>
                              )}
                            </div>
                          </div>
                        </SidebarMenuSubItem>
                      ) : (
                        <>
                          {displayProjects.map((project) => (
                            <SidebarMenuSubItem key={project.id}>
                              <div
                                className={cn(
                                  "group flex items-start justify-between min-h-[44px] py-1 rounded-md",
                                  currentProject?.id === project.id &&
                                    "bg-sidebar-accent text-sidebar-accent-foreground"
                                )}
                              >
                                <SidebarMenuSubButton
                                  className="group/btn flex-1 h-auto py-2 items-start"
                                  onClick={() => handleProjectSelect(project)}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div
                                      className="w-3 h-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: project.color }}
                                    />
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="truncate font-medium">{project.name}</span>
                                      {project.description && (
                                        <span className="text-xs text-muted-foreground truncate">
                                          {project.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </SidebarMenuSubButton>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-sidebar-accent"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentProject(project);
                                    setSettingsOpen(true);
                                  }}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
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