import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface SimulationControlsProps {
  isSimulationRunning: boolean;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  canControl: boolean;
}

export const SimulationControls = ({ 
  isSimulationRunning, 
  onStartSimulation, 
  onStopSimulation, 
  canControl 
}: SimulationControlsProps) => {
  if (!canControl) {
    return null;
  }

  return (
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
            onClick={onStartSimulation}
            disabled={isSimulationRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Simulation
          </Button>
          <Button
            onClick={onStopSimulation}
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
  );
};