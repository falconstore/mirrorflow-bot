import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChannelConfiguration } from "@/components/dashboard/ChannelConfiguration";
import { LiveCycle } from "@/components/dashboard/LiveCycle";
import { ReplicationLogs } from "@/components/dashboard/ReplicationLogs";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has a config
      const { data: config } = await supabase
        .from("telegram_configs")
        .select("id")
        .single();

      if (config) {
        setConfigId(config.id);
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <ChannelConfiguration configId={configId} onConfigCreated={setConfigId} />
        
        {configId && (
          <>
            <LiveCycle configId={configId} />
            <ReplicationLogs configId={configId} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
