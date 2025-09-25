import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Monitor, Eye, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const DashboardHeader = () => {
  const { profile, signOut } = useAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "operator":
        return <Monitor className="h-4 w-4" />;
      case "viewer":
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
          Quality Monitoring Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Real-time batch monitoring and quality control</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border">
          {getRoleIcon(profile?.role || 'viewer')}
          <span className="text-sm font-medium">{profile?.full_name}</span>
          <Badge variant="outline" className="text-xs">
            {profile?.role}
          </Badge>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};