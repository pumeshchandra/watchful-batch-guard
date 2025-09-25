import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSimulation } from "@/hooks/useSimulation";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { KPICards } from "./dashboard/KPICards";
import { BatchChart } from "./dashboard/BatchChart";
import { AlertsTable } from "./dashboard/AlertsTable";
import { SimulationControls } from "./dashboard/SimulationControls";

const Dashboard = () => {
  const { profile } = useAuth();
  const { batchData, alerts, loading, refetchData } = useDashboardData();
  const { isSimulationRunning, handleStartSimulation, handleStopSimulation } = useSimulation(refetchData);

  const canControl = profile?.role === 'admin' || profile?.role === 'operator';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <DashboardHeader />
      <KPICards 
        batchData={batchData} 
        alerts={alerts} 
        isSimulationRunning={isSimulationRunning} 
      />
      <BatchChart batchData={batchData} />
      <AlertsTable alerts={alerts} />
      <SimulationControls
        isSimulationRunning={isSimulationRunning}
        onStartSimulation={handleStartSimulation}
        onStopSimulation={handleStopSimulation}
        canControl={canControl}
      />
    </div>
  );
};

export default Dashboard;