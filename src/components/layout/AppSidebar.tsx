import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FolderKanban, Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    title: "Projects",
    icon: FolderKanban,
    href: "/projects"
  }
];

export function AppSidebar() {
  return (
    <Sidebar className="border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-0 pt-0">
        <div className="flex items-start justify-center -mt-2">
          <img 
            src="/lovable-uploads/bab98990-b821-4f3c-b23f-93143f8c722c.png" 
            alt="PROTOTYPE"
            className="h-40 object-contain"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-2">
        <SidebarGroup>
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
      </SidebarContent>
    </Sidebar>
  );
}