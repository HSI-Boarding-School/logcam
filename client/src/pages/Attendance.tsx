import { useState } from "react";
import { Camera, Laptop, Smartphone, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

export default function Attendance() {
  const [deviceType, setDeviceType] = useState<"laptop" | "phone">("laptop");
  const navigate = useNavigate();

  const handleBorrow = () => {
    if (deviceType === "laptop") navigate("/take-laptop");
    else navigate("/take-phone");
  };

  const handleReturn = () => {
    if (deviceType === "laptop") navigate("/return-laptop");
    else navigate("/return-phone");
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="text-center space-y-3 sm:space-y-4 px-4">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm font-semibold">
            Face Recognition Attendance
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight">
          Scan Your Face to{" "}
          <span className="text-gradient-primary">Record Attendance</span>
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-secondary max-w-2xl mx-auto">
          Use our advanced face recognition technology to quickly borrow or
          return devices
        </p>
      </div>

      <div className="flex justify-center px-4">
        <Tabs
          value={deviceType}
          onValueChange={(v) => setDeviceType(v as "laptop" | "phone")}
          className="w-full sm:w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2 p-1 h-12 sm:h-14 bg-muted/50 rounded-xl sm:rounded-2xl">
            <TabsTrigger
              value="laptop"
              className="gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all"
            >
              <Laptop className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold text-sm sm:text-base">Laptop</span>
            </TabsTrigger>
            <TabsTrigger
              value="phone"
              className="gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white transition-all"
            >
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold text-sm sm:text-base">Phone</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <Card className="card-hover-lift border-2 overflow-hidden glass-card">
          <div className="absolute top-0 right-0 w-28 h-28 sm:w-40 sm:h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-[120px]" />
          <CardHeader className="relative p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Take {deviceType === "laptop" ? "Laptop" : "Phone"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Position your face in the camera frame to start taking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 relative p-4 sm:p-6">
            <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors group">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="p-4 sm:p-6 rounded-full bg-primary/10 inline-flex group-hover:scale-110 transition-transform">
                  <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-secondary px-4">
                  This will open the camera page
                </p>
              </div>
            </div>
            <Button
              onClick={handleBorrow}
              variant="gradient"
              size="lg"
              className="w-full text-sm sm:text-base h-11 sm:h-12"
            >
              <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Face Recognition
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover-lift border-2 overflow-hidden glass-card">
          <div className="absolute top-0 right-0 w-28 h-28 sm:w-40 sm:h-40 bg-gradient-to-br from-teal-500/20 to-transparent rounded-bl-[120px]" />
          <CardHeader className="relative p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Return {deviceType === "laptop" ? "Laptop" : "Phone"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Scan your face to complete the device return process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 relative p-4 sm:p-6">
            <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-teal-500/40 transition-colors group">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="p-4 sm:p-6 rounded-full bg-teal-500/10 inline-flex group-hover:scale-110 transition-transform">
                  <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-teal-600" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-secondary px-4">
                  This will open the camera page
                </p>
              </div>
            </div>
            <Button
              onClick={handleReturn}
              variant="gradient-accent"
              size="lg"
              className="w-full text-sm sm:text-base h-11 sm:h-12"
              style={{
                background:
                  "linear-gradient(135deg, hsl(173, 67%, 47%) 0%, hsl(160, 60%, 45%) 100%)",
              }}
            >
              <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Face Recognition
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Recent Scans</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center py-10 sm:py-12 text-muted-foreground">
            <Camera className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 opacity-20" />
            <p className="font-secondary text-sm sm:text-base">
              No recent face scans recorded
            </p>
            <p className="text-xs sm:text-sm mt-1">
              Recent activity will appear here after scanning
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
