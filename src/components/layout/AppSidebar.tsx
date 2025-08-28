import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FolderKanban, Users, BarChart3, Settings, Plus, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/dashboard"
  },
  {
    title: "Projects",
    icon: FolderKanban,
    href: "/projects"
  },
  {
    title: "Teams", 
    icon: Users,
    href: "/teams"
  },
  {
    title: "Canvas",
    icon: Layers,
    href: "/canvas"
  }
];

const tools = [
  {
    title: "Automations",
    icon: Zap,
    href: "/automations"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings"
  }
];

export function AppSidebar() {
  return (
    <Sidebar className="border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">ProjectFlow</h1>
            <p className="text-xs text-sidebar-foreground/60">Project Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-sidebar-foreground/60 mb-2">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-8">
          <Button 
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-card-hover transition-all"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}