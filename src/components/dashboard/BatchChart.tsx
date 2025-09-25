import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BatchData } from "@/hooks/useDashboardData";

interface BatchChartProps {
  batchData: BatchData[];
}

export const BatchChart = ({ batchData }: BatchChartProps) => {
  if (batchData.length === 0) {
    return null;
  }

  return (
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
  );
};