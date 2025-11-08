import { Home, Clock, Users, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Attendance", url: "/attendance", icon: Clock },
  { title: "Users List", url: "/user-list", icon: Users },
  { title: "Logbook", url: "/logbook", icon: BookOpen },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <Sidebar collapsible="icon" className="hidden md:flex border-r-2">
        <SidebarContent>
          <div className="px-5 py-8 border-b-2">
            <div className={`transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
              <h2 className="font-bold text-2xl text-gradient-primary">Logcam</h2>
              <p className="text-xs text-muted-foreground font-secondary mt-1">Face Recognition</p>
            </div>
          </div>
          
          <SidebarGroup className="mt-4">
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"}
                        className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all hover:bg-sidebar-accent group"
                        activeClassName="bg-gradient-to-r from-primary to-primary/80 text-white font-semibold shadow-md hover:text-gray"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t-2 z-50 flex items-center justify-around px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]"
            activeClassName="text-primary font-semibold"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
