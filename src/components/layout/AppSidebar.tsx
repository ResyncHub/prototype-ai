import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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
  const { open, setOpen } = useSidebar();
  
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
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4 group-data-[collapsible=icon]:mx-auto" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
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