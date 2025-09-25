import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Alert } from "@/hooks/useDashboardData";

interface AlertsTableProps {
  alerts: Alert[];
}

export const AlertsTable = ({ alerts }: AlertsTableProps) => {
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

  return (
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
                    {alert.parameter_value?.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {alert.threshold_value?.toFixed(2)}
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
  );
};