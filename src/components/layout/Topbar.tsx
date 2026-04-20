import * as React from "react";
import { Search, User, Bell, Settings, LogOut, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
        <div className="h-4 w-px bg-border/60 hidden md:block" />
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link
                    to="/"
                    className="font-medium hover:text-primary transition-colors"
                  />
                }
              >
                Yuva Classes
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {pathSegments.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold text-foreground">
                  Dashboard
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              pathSegments.map((segment, index) => {
                const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;
                const label =
                  segment.charAt(0).toUpperCase() + segment.slice(1);

                return (
                  <React.Fragment key={url}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="font-bold text-foreground">
                          {label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          render={
                            <Link
                              to={url}
                              className="font-medium hover:text-primary transition-colors"
                            />
                          }
                        >
                          {label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden lg:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search anything... (⌘K)"
            className="w-72 pl-10 h-9 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/30 transition-all rounded-full"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Button>
          <div className="h-4 w-px bg-border/60 mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 ring-primary/10"
                >
                  <Avatar className="h-9 w-9 transition-transform hover:scale-105 active:scale-95">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@admin"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      AD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
            <DropdownMenuContent
              className="w-56 mt-2 shadow-xl border-border/50 animate-in fade-in slide-in-from-top-2 duration-200"
              align="end"
            >
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground opacity-70">
                    admin@yuvaclasses.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem
                  onClick={() => navigate("/admin/settings")}
                  className="cursor-pointer rounded-md"
                >
                  <User className="mr-2 h-4 w-4 opacity-70" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/admin/settings")}
                  className="cursor-pointer rounded-md"
                >
                  <Settings className="mr-2 h-4 w-4 opacity-70" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 rounded-md transition-colors m-1"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
