import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import UserList from "./pages/UserList";
import Logbook from "./pages/Logbook";
import NotFound from "./pages/NotFound";
import ReturnLaptop from "./pages/camera/return-laptop";
import TakePhone from "./pages/camera/take-phone";
import TakeLaptop from "./pages/camera/take-laptop";
import ReturnPhone from "./pages/camera/return-phone";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ✅ ROUTE DENGAN SIDEBAR & TOPBAR */}
          <Route
            path="/*"
            element={
              <SidebarProvider>
                <div className="min-h-screen flex w-full flex-col md:flex-row">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col pb-16 md:pb-0">
                    <TopBar />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/user-list" element={<UserList />} />
                        <Route path="/logbook" element={<Logbook />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            }
          />

          {/* ROUTE Without LAYOUT (FULL SCREEN) */}
          <Route path="/take-laptop" element={<TakeLaptop />} />
          <Route path="/return-laptop" element={<ReturnLaptop />} />
          <Route path="/take-phone" element={<TakePhone />} />
          <Route path="/return-phone" element={<ReturnPhone />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
