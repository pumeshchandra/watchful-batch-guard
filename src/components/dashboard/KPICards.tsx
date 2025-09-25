import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle } from "lucide-react";
import type { BatchData, Alert } from "@/hooks/useDashboardData";

interface KPICardsProps {
  batchData: BatchData[];
  alerts: Alert[];
  isSimulationRunning: boolean;
}

export const KPICards = ({ batchData, alerts, isSimulationRunning }: KPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{new Set(batchData.map(b => b.batch_id)).size}</div>
          <p className="text-xs text-muted-foreground">Active monitoring</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <Bell className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{alerts.filter(a => !a.acknowledged).length}</div>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-critical" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-critical">
            {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length}
          </div>
          <p className="text-xs text-muted-foreground">Immediate action needed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {isSimulationRunning ? "Active" : "Standby"}
          </div>
          <p className="text-xs text-muted-foreground">
            {isSimulationRunning ? "Monitoring in progress" : "Simulation paused"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};