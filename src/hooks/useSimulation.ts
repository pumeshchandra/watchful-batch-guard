import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSimulation = (refetchData: () => Promise<void>) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const generateMockData = async () => {
    console.log('generateMockData called with:', { userId: user?.id, email: profile?.email });
    
    if (!user?.id) {
      console.error('Cannot generate mock data - missing user ID');
      toast({
        title: "Authentication Error",
        description: "User must be authenticated to generate data",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.email) {
      console.error('Cannot generate mock data - missing profile email');
      toast({
        title: "Profile Error", 
        description: "User profile email is required for alerts",
        variant: "destructive",
      });
      return;
    }

    console.log('Generating mock data for user:', user.id);
    const batchId = `BATCH-${Date.now()}`;
    const temperature = 85 + Math.random() * 10;
    const pressure = 2.1 + Math.random() * 0.4;
    const ph = 7.2 + Math.random() * 0.6;
    const viscosity = 1200 + Math.random() * 200;

    // Insert batch data
    try {
      const { error: batchError } = await supabase
        .from('batch_data')
        .insert({
          batch_id: batchId,
          temperature,
          pressure,
          ph,
          viscosity,
          user_id: user.id
        });

      if (batchError) {
        console.error('Error inserting batch data:', batchError);
        toast({
          title: "Database error",
          description: `Failed to insert batch data: ${batchError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Batch data inserted successfully:', batchId);
    } catch (error: any) {
      console.error('Unexpected error inserting batch data:', error);
      toast({
        title: "Unexpected error",
        description: "Failed to insert batch data",
        variant: "destructive",
      });
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

    console.log(`Found ${violations.length} violations for batch ${batchId}:`, violations);

    // Insert alerts and send emails
    for (const violation of violations) {
      try {
        const { error: alertError } = await supabase
          .from('alerts')
          .insert({
            ...violation,
            user_id: user.id
          });

        if (alertError) {
          console.error('Error inserting alert:', alertError);
          continue;
        }

        console.log('Alert inserted successfully:', violation.title);

        // Send email alert
        try {
          console.log('Sending email alert for:', violation.title);
          const emailResponse = await supabase.functions.invoke('send-alert-email', {
            body: {
              to: profile.email,
              ...violation,
            },
          });
          
          if (emailResponse.error) {
            console.error('Error from email function:', emailResponse.error);
          } else {
            console.log('Alert email sent successfully for:', violation.title);
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      } catch (error: any) {
        console.error('Unexpected error processing violation:', error);
      }
    }

    // Refresh data
    await refetchData();
  };

  // Simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimulationRunning && user?.id && profile?.email) {
      interval = setInterval(() => {
        generateMockData();
      }, 3000); // Generate data every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulationRunning, user?.id, profile?.email]);

  const handleStartSimulation = () => {
    console.log('handleStartSimulation called');
    console.log('Auth state:', { userId: user?.id, profileEmail: profile?.email });
    
    if (!user?.id) {
      console.error('Cannot start simulation - user not authenticated');
      toast({
        title: "Authentication required",
        description: "Please ensure you are logged in to start simulation",
        variant: "destructive",
      });
      return;
    }
    
    if (!profile?.email) {
      console.error('Cannot start simulation - profile email missing');
      toast({
        title: "Profile incomplete",
        description: "Profile email is required for email alerts",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Starting simulation for user:', user.id);
    setIsSimulationRunning(true);
    toast({
      title: "Simulation started",
      description: "Mock data generation and monitoring active",
    });
  };

  const handleStopSimulation = () => {
    console.log('Stopping simulation');
    setIsSimulationRunning(false);
    toast({
      title: "Simulation stopped", 
      description: "Mock data generation paused",
    });
  };

  return {
    isSimulationRunning,
    handleStartSimulation,
    handleStopSimulation
  };
};