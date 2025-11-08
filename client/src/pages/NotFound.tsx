import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full border-2 card-hover-lift">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="inline-flex p-6 rounded-full bg-primary/10">
            <AlertCircle className="h-16 w-16 text-primary" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-6xl font-bold text-gradient-primary">404</h1>
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground font-secondary">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <Button asChild variant="gradient" size="lg" className="mt-6">
            <a href="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Dashboard
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
