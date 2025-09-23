import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Play, Square, Shield, Monitor, Eye, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BatchData {
  id: string;
  batch_id: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  ph: number;
  viscosity: number;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  parameter_type: string;
  parameter_value: number;
  threshold_value: number;
  batch_id: string;
  acknowledged: boolean;
  created_at: string;
}

const UpdatedDashboard = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [batchData, setBatchData] = useState<BatchData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from database
  const fetchData = async () => {
    try {
      // Fetch batch data
      const { data: batchDataResponse, error: batchError } = await supabase
        .from('batch_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (batchError) throw batchError;

      // Fetch alerts
      const { data: alertsResponse, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError) throw alertsError;

      setBatchData(batchDataResponse || []);
      setAlerts((alertsResponse || []) as Alert[]);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Generate mock data for simulation
  const generateMockData = async () => {
    if (!profile?.id) return;

    const batchId = `BATCH-${Date.now()}`;
    const temperature = 85 + Math.random() * 10;
    const pressure = 2.1 + Math.random() * 0.4;
    const ph = 7.2 + Math.random() * 0.6;
    const viscosity = 1200 + Math.random() * 200;

    // Insert batch data
    const { error: batchError } = await supabase
      .from('batch_data')
      .insert({
        batch_id: batchId,
        temperature,
        pressure,
        ph,
        viscosity,
        user_id: profile.id
      });

    if (batchError) {
      console.error('Error inserting batch data:', batchError);
      return;
    }

    // Check for violations and create alerts
    const violations = [];
    
    if (temperature > 90) {
      violations.push({
        title: "High Temperature Alert",
        message: `Temperature exceeded safe threshold in ${batchId}`,
        severity: temperature > 95 ? 'critical' as const : 'high' as const,
        parameter_type: "Temperature",
        parameter_value: temperature,
        threshold_value: 90,
        batch_id: batchId,
      });
    }

    if (pressure > 2.4) {
      violations.push({
        title: "High Pressure Alert",
        message: `Pressure exceeded safe threshold in ${batchId}`,
        severity: pressure > 2.5 ? 'critical' as const : 'high' as const,
        parameter_type: "Pressure",
        parameter_value: pressure,
        threshold_value: 2.4,
        batch_id: batchId,
      });
    }

    if (ph < 7.0 || ph > 8.0) {
      violations.push({
        title: "pH Level Alert",
        message: `pH level out of acceptable range in ${batchId}`,
        severity: 'medium' as const,
        parameter_type: "pH",
        parameter_value: ph,
        threshold_value: ph < 7.0 ? 7.0 : 8.0,
        batch_id: batchId,
      });
    }

    // Insert alerts and send emails
    for (const violation of violations) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert({
          ...violation,
          user_id: profile.id
        });

      if (alertError) {
        console.error('Error inserting alert:', alertError);
        continue;
      }

      // Send email alert
      try {
        await supabase.functions.invoke('send-alert-email', {
          body: {
            to: profile.email,
            ...violation,
          },
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    // Refresh data
    fetchData();
  };

  // Simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimulationRunning) {
      interval = setInterval(() => {
        generateMockData();
      }, 3000); // Generate data every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulationRunning, profile?.id]);

  const handleStartSimulation = () => {
    setIsSimulationRunning(true);
    toast({
      title: "Simulation started",
      description: "Mock data generation and monitoring active",
    });
  };

  const handleStopSimulation = () => {
    setIsSimulationRunning(false);
    toast({
      title: "Simulation stopped",
      description: "Mock data generation paused",
    });
  };

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const canControl = profile?.role === 'admin' || profile?.role === 'operator';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
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

      {/* KPI Cards */}
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

      {/* Charts */}
      {batchData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Batch Parameters Over Time</CardTitle>
            <CardDescription>Real-time monitoring of critical parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={batchData.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="hsl(var(--critical))" 
                    strokeWidth={2}
                    name="Temperature (°C)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    name="Pressure (bar)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ph" 
                    stroke="hsl(var(--info))" 
                    strokeWidth={2}
                    name="pH Level"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="viscosity" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Viscosity (cP)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Latest system alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No alerts found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.slice(0, 10).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.title}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{alert.batch_id}</TableCell>
                    <TableCell>{alert.parameter_type}</TableCell>
                    <TableCell className="font-mono">
                      {alert.parameter_value.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {alert.threshold_value.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      {canControl && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Controls</CardTitle>
            <CardDescription>
              Start or stop the simulation to generate mock batch data and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleStartSimulation}
                disabled={isSimulationRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Simulation
              </Button>
              <Button
                onClick={handleStopSimulation}
                disabled={!isSimulationRunning}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Simulation
              </Button>
            </div>
            {isSimulationRunning && (
              <p className="text-sm text-muted-foreground mt-4">
                Simulation is running. Mock data will be generated every 3 seconds.
                Email alerts will be sent for critical violations.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UpdatedDashboard;