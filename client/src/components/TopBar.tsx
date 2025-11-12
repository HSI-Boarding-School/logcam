import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/stores/useAuthStore";


export function TopBar() {
  const user = useAuthStore((state) => state.user)
  console.log(user)
  return (
    <header className="h-16 sm:h-20 border-b-2 border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-6">
        <SidebarTrigger className="hidden md:flex" />
        <div>
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold">
            <span className="text-gradient-primary">HSI</span> Boarding School
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-secondary hidden sm:block">Logcam Attendance System</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-2 w-2 bg-accent rounded-full"></span>
        </Button>
        
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-semibold">{user.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-secondary">Administrator</p>
          </div>
          <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border-2 border-primary/30">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-sm sm:text-lg">
              {user.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
