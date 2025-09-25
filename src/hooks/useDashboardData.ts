import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BatchData {
  id: string;
  batch_id: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  ph: number;
  viscosity: number;
}

export interface Alert {
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

export const useDashboardData = () => {
  const { toast } = useToast();
  const [batchData, setBatchData] = useState<BatchData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch batch data
      const { data: batchDataResponse, error: batchError } = await supabase
        .from('batch_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (batchError) {
        console.error('Error fetching batch data:', batchError);
        throw batchError;
      }

      // Fetch alerts
      const { data: alertsResponse, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError) {
        console.error('Error fetching alerts:', alertsError);
        throw alertsError;
      }

      console.log('Data fetched successfully:', {
        batchCount: batchDataResponse?.length || 0,
        alertCount: alertsResponse?.length || 0
      });

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

  return {
    batchData,
    alerts,
    loading,
    refetchData: fetchData
  };
};