import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Radio, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveCycleProps {
  configId: string;
}

interface LiveEvent {
  source_channel_name: string;
  destination_channel_name: string;
  message_type: string;
  status: string;
  timestamp: string;
}

export const LiveCycle = ({ configId }: LiveCycleProps) => {
  const [replicating, setReplicating] = useState(false);
  const [lastEvent, setLastEvent] = useState<LiveEvent | null>(null);
  const [destinations, setDestinations] = useState<string[]>([]);

  useEffect(() => {
    // Fetch destination channels
    const fetchDestinations = async () => {
      const { data } = await supabase
        .from("destination_channels")
        .select("channel_name")
        .eq("config_id", configId);
      
      if (data) {
        setDestinations(data.map(d => d.channel_name));
      }
    };

    fetchDestinations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('replication_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'replication_logs',
          filter: `config_id=eq.${configId}`,
        },
        (payload) => {
          setReplicating(true);
          setTimeout(() => setReplicating(false), 2000);
          
          // Simulate event display
          setLastEvent({
            source_channel_name: "Canal VIP",
            destination_channel_name: "Canal de Destino",
            message_type: payload.new.message_type,
            status: payload.new.status,
            timestamp: new Date().toISOString(),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [configId]);

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'photo': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📄';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" />
          <CardTitle>Live Cycle - Visualização em Tempo Real</CardTitle>
        </div>
        <CardDescription>
          Acompanhe a replicação de mensagens ao vivo
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-center gap-8 py-8">
          {/* Source Channel */}
          <div className={cn(
            "flex flex-col items-center gap-2 transition-all duration-300",
            replicating && "scale-110"
          )}>
            <div className={cn(
              "bg-primary/10 p-4 rounded-full transition-all duration-300",
              replicating && "ring-4 ring-primary/50 animate-pulse"
            )}>
              <Radio className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium">Canal VIP</p>
          </div>

          {/* Replication Arrow */}
          <div className="flex flex-col items-center">
            {replicating ? (
              <>
                <Zap className="w-6 h-6 text-warning animate-pulse" />
                <p className="text-xs text-warning mt-1">Replicando...</p>
              </>
            ) : (
              <div className="text-muted-foreground">→</div>
            )}
            {lastEvent && (
              <p className="text-xs text-muted-foreground mt-2">
                {getMessageTypeIcon(lastEvent.message_type)} {lastEvent.message_type}
              </p>
            )}
          </div>

          {/* Destination Channels */}
          <div className="flex flex-wrap gap-4">
            {destinations.slice(0, 3).map((dest, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "bg-muted p-3 rounded-full transition-all duration-500",
                  replicating && "bg-success/20"
                )}>
                  {replicating ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <Radio className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-center max-w-[80px] truncate">{dest}</p>
              </div>
            ))}
            {destinations.length > 3 && (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-muted p-3 rounded-full">
                  <p className="text-sm font-medium">+{destinations.length - 3}</p>
                </div>
                <p className="text-xs">mais</p>
              </div>
            )}
          </div>
        </div>

        {lastEvent && (
          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            Última replicação: {new Date(lastEvent.timestamp).toLocaleString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
