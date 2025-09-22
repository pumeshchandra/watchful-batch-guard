import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Activity, 
  AlertTriangle, 
  Mail, 
  TrendingUp, 
  Settings, 
  LogOut,
  RefreshCw,
  Zap,
  Shield,
  Eye
} from "lucide-react";

interface DashboardProps {
  userRole: string;
  onLogout: () => void;
}

// Mock data generators
const generateBatchData = () => {
  const now = new Date();
  const data = [];
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: 85 + Math.random() * 10,
      pressure: 45 + Math.random() * 5,
      pH: 7.2 + Math.random() * 0.6,
      viscosity: 120 + Math.random() * 20
    });
  }
  return data;
};

const generateViolations = () => [
  {
    id: "V001",
    timestamp: "14:32:15",
    batchId: "BTH-2024-0892",
    parameter: "Temperature",
    value: 96.2,
    threshold: 95.0,
    severity: "Critical"
  },
  {
    id: "V002",
    timestamp: "13:45:22",
    batchId: "BTH-2024-0891",
    parameter: "pH",
    value: 8.1,
    threshold: 8.0,
    severity: "Warning"
  },
  {
    id: "V003",
    timestamp: "12:18:09",
    batchId: "BTH-2024-0890",
    parameter: "Pressure",
    value: 52.3,
    threshold: 50.0,
    severity: "Warning"
  }
];

const generateAlerts = () => [
  { time: "14:32", message: "Critical temperature violation in BTH-2024-0892", severity: "Critical" },
  { time: "13:45", message: "pH threshold exceeded in BTH-2024-0891", severity: "Warning" },
  { time: "12:18", message: "Pressure warning in BTH-2024-0890", severity: "Warning" },
  { time: "11:30", message: "Batch BTH-2024-0889 completed successfully", severity: "Success" },
];

const Dashboard = ({ userRole, onLogout }: DashboardProps) => {
  const [batchData, setBatchData] = useState(generateBatchData());
  const [violations] = useState(generateViolations());
  const [alerts] = useState(generateAlerts());
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        setBatchData(generateBatchData());
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  const getRoleIcon = () => {
    switch (userRole) {
      case "admin": return <Shield className="h-4 w-4" />;
      case "operator": return <Settings className="h-4 w-4" />;
      case "viewer": return <Eye className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-critical text-critical-foreground";
      case "warning": return "bg-warning text-warning-foreground";
      case "success": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const canControl = userRole === "admin" || userRole === "operator";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Quality Monitor
            </h1>
            <Badge variant="outline" className="flex items-center gap-1">
              {getRoleIcon()}
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {canControl && (
              <Button
                variant={isSimulating ? "destructive" : "default"}
                onClick={() => setIsSimulating(!isSimulating)}
                className="flex items-center gap-2"
              >
                {isSimulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {isSimulating ? "Stop Simulation" : "Start Simulation"}
              </Button>
            )}
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations Today</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">3</div>
              <p className="text-xs text-muted-foreground">2 warnings, 1 critical</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts Sent</CardTitle>
              <Mail className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Last alert: 14:32</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Parameters (Last 24h)</CardTitle>
              <CardDescription>Real-time monitoring of critical parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }} 
                  />
                  <Line type="monotone" dataKey="temperature" stroke="hsl(var(--critical))" strokeWidth={2} />
                  <Line type="monotone" dataKey="pressure" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="pH" stroke="hsl(var(--warning))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Timeline</CardTitle>
              <CardDescription>Recent system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="text-sm font-mono text-muted-foreground">{alert.time}</div>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <div className="text-sm flex-1">{alert.message}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Violations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Violations</CardTitle>
            <CardDescription>Parameter threshold violations requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2">Time</th>
                    <th className="text-left p-2">Batch ID</th>
                    <th className="text-left p-2">Parameter</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Threshold</th>
                    <th className="text-left p-2">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((violation) => (
                    <tr key={violation.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-2 font-mono">{violation.timestamp}</td>
                      <td className="p-2 font-mono">{violation.batchId}</td>
                      <td className="p-2">{violation.parameter}</td>
                      <td className="p-2 font-mono">{violation.value.toFixed(1)}</td>
                      <td className="p-2 font-mono">{violation.threshold.toFixed(1)}</td>
                      <td className="p-2">
                        <Badge className={getSeverityColor(violation.severity)}>
                          {violation.severity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Simulator Controls - Only for Admin/Operator */}
        {canControl && (
          <Card>
            <CardHeader>
              <CardTitle>Simulation Controls</CardTitle>
              <CardDescription>Configure batch simulation parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch Size</label>
                  <div className="flex items-center justify-between p-2 border border-border rounded">
                    <span>1000 L</span>
                    <Badge variant="outline">Standard</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Frequency</label>
                  <div className="flex items-center justify-between p-2 border border-border rounded">
                    <span>3 seconds</span>
                    <Badge variant="outline">Real-time</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Threshold Config</label>
                  <div className="flex items-center justify-between p-2 border border-border rounded">
                    <span>Standard Limits</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;