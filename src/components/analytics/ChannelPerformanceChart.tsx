import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface Log {
  destination_channel_id: number;
}

interface Props {
  logs: Log[];
  configId: string | null;
}

export const ChannelPerformanceChart = ({ logs, configId }: Props) => {
  const [data, setData] = useState<{ name: string; messages: number }[]>([]);

  useEffect(() => {
    if (configId) {
      getChannelPerformance();
    }
  }, [logs, configId]);

  const getChannelPerformance = async () => {
    const channelCounts = logs.reduce((acc, log) => {
      const channelId = log.destination_channel_id;
      acc[channelId] = (acc[channelId] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });
    
    const channelIds = Object.keys(channelCounts).map(Number);
    
    if (channelIds.length === 0) {
      setData([]);
      return;
    }

    const { data: channels } = await supabase
      .from("destination_channels")
      .select("channel_id, channel_name")
      .in("channel_id", channelIds);
    
    const chartData = Object.entries(channelCounts)
      .map(([channelId, count]) => {
        const channel = channels?.find(c => c.channel_id === Number(channelId));
        return {
          name: channel?.channel_name || `Canal ${channelId}`,
          messages: count
        };
      })
      .sort((a, b) => b.messages - a.messages)
      .slice(0, 10);
    
    setData(chartData);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          type="number"
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={120}
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px"
          }}
        />
        <Bar 
          dataKey="messages" 
          fill="hsl(var(--primary))" 
          radius={[0, 8, 8, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
