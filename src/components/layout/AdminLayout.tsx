import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

import { adminRoutes } from "@/routes";

export default function AdminLayout() {
  const location = useLocation();
  
  // Find the current route label from the config
  const currentRoute = adminRoutes.find(route => {
    // Exact match
    if (route.path === location.pathname) return true;
    // Parameter match (e.g., /admin/courses/:courseId)
    if (route.path.includes(':')) {
      const base = route.path.split('/:')[0];
      return location.pathname.startsWith(base);
    }
    return false;
  });

  const title = currentRoute?.label || "Admin Panel";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar title={title} />
        <main className="flex-1 min-w-0 overflow-hidden px-6 py-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
