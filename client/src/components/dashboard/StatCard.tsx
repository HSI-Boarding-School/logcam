import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  gradient?: string;
}

export function StatCard({ title, value, icon: Icon, iconColor, gradient }: StatCardProps) {
  return (
    <Card className="card-hover-lift border-2 overflow-hidden relative group">
      {gradient && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
          style={{ background: gradient }}
        />
      )}
      <CardContent className="p-4 sm:p-6 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 sm:space-y-2 min-w-0">
            <p className="text-xs sm:text-sm font-secondary text-muted-foreground font-medium truncate">{title}</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-secondary tracking-tight">{value}</p>
          </div>
          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${iconColor} shadow-lg flex-shrink-0`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
