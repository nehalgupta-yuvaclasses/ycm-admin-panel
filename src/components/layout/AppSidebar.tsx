import * as React from "react";
import {
  BookOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";


import { useAuthStore } from "@/stores/useAuthStore";
import { adminRoutes } from "@/routes";

export function AppSidebar() {
  const location = useLocation();
  const { profile } = useAuthStore();

  // Filter routes for sidebar display
  const menuItems = adminRoutes.filter(route => {
    // Hidden routes (like builders)
    if (route.showInSidebar === false) return false;

    // Permission check
    if (route.permission && profile?.permissions && !profile.permissions.includes(route.permission)) {
      return false;
    }

    return true;
  });

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') return true;
    if (path !== '/admin/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))]">
      <SidebarHeader className="h-16 border-b border-sidebar-border px-2 py-3 group-data-[collapsible=icon]:px-0">
        <div className="flex w-full items-center gap-3 overflow-hidden px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-none text-sidebar-foreground">Yuva Classes</p>
            <p className="mt-1 text-[11px] text-sidebar-foreground/70">Admin panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="px-3 text-[10px] font-medium text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
            Main menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    render={<Link to={item.path} />}
                    isActive={isActive(item.path)}
                    tooltip={item.label}
                    className={cn(
                      "h-9 px-3 transition-colors duration-150 rounded-md group/btn justify-start group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                      isActive(item.path)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 group-data-[collapsible=icon]:bg-sidebar-primary group-data-[collapsible=icon]:text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive(item.path)
                        ? "text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/60 group-hover/btn:text-sidebar-accent-foreground"
                    )} />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">{item.label}</span>
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
