import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Radio, Zap, CheckCircle2, Power, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const { toast } = useToast();
  const [replicating, setReplicating] = useState(false);
  const [lastEvent, setLastEvent] = useState<LiveEvent | null>(null);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [botStatus, setBotStatus] = useState<'active' | 'paused'>('active');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [workerOnline, setWorkerOnline] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [lastRestart, setLastRestart] = useState<string | null>(null);
  const [restartRequested, setRestartRequested] = useState(false);

  useEffect(() => {
    // Fetch destination channels and bot status
    const fetchData = async () => {
      const { data: destData } = await supabase
        .from("destination_channels")
        .select("channel_name")
        .eq("config_id", configId);
      
      if (destData) {
        setDestinations(destData.map(d => d.channel_name));
      }

      const { data: configData } = await supabase
        .from("telegram_configs")
        .select("status, worker_last_heartbeat, last_restart_at, restart_requested")
        .eq("id", configId)
        .single();
      
      if (configData) {
        setBotStatus(configData.status as 'active' | 'paused');
        setLastHeartbeat(configData.worker_last_heartbeat);
        setLastRestart(configData.last_restart_at);
        setRestartRequested(configData.restart_requested || false);
        
        // Check if worker is online (heartbeat within last 60 seconds)
        if (configData.worker_last_heartbeat) {
          const lastBeat = new Date(configData.worker_last_heartbeat);
          const now = new Date();
          const diffSeconds = (now.getTime() - lastBeat.getTime()) / 1000;
          setWorkerOnline(diffSeconds < 60);
        }
      }
    };

    fetchData();

    // Check worker health every 10 seconds
    const healthCheck = setInterval(() => {
      fetchData();
    }, 10000);

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
      clearInterval(healthCheck);
      supabase.removeChannel(channel);
    };
  }, [configId]);

  const toggleBotStatus = async () => {
    setLoadingStatus(true);
    try {
      const newStatus = botStatus === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from("telegram_configs")
        .update({ status: newStatus })
        .eq("id", configId);

      if (error) throw error;

      setBotStatus(newStatus);
      toast({
        title: newStatus === 'active' ? "Bot ativado" : "Bot pausado",
        description: newStatus === 'active' 
          ? "O bot voltará a replicar mensagens." 
          : "O bot está pausado. Mensagens não serão replicadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const requestRestart = async () => {
    if (restartRequested) {
      toast({
        title: "Reinício já solicitado",
        description: "Aguarde o worker processar o restart anterior.",
        variant: "default",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("telegram_configs")
        .update({ restart_requested: true })
        .eq("id", configId);

      if (error) throw error;

      setRestartRequested(true);
      toast({
        title: "🔄 Reiniciando worker...",
        description: "O worker será reiniciado em alguns segundos.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao solicitar restart",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            <CardTitle>Live Cycle - Visualização em Tempo Real</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={workerOnline ? 'default' : 'destructive'} className="gap-1">
              <div className={cn("w-2 h-2 rounded-full", workerOnline ? "bg-green-500 animate-pulse" : "bg-red-500")} />
              {workerOnline ? 'Worker Online' : 'Worker Offline'}
            </Badge>
            <Badge variant={botStatus === 'active' ? 'default' : 'secondary'} className="gap-1">
              <Power className="w-3 h-3" />
              {botStatus === 'active' ? 'Operacional' : 'Pausado'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={requestRestart}
              disabled={restartRequested || !workerOnline}
              className="gap-2"
            >
              <RotateCw className={cn("w-4 h-4", restartRequested && "animate-spin")} />
              Reiniciar Worker
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {botStatus === 'active' ? 'Ativo' : 'Pausado'}
              </span>
              <Switch 
                checked={botStatus === 'active'} 
                onCheckedChange={toggleBotStatus}
                disabled={loadingStatus}
              />
            </div>
          </div>
        </div>
        <CardDescription>
          {botStatus === 'active' 
            ? 'Acompanhe a replicação de mensagens ao vivo' 
            : '⚠️ Bot em manutenção - mensagens não serão replicadas'}
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

        <div className="mt-6 pt-6 border-t border-border space-y-2">
          {lastEvent && (
            <div className="text-center text-sm text-muted-foreground">
              Última replicação: {new Date(lastEvent.timestamp).toLocaleString('pt-BR')}
            </div>
          )}
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            {lastHeartbeat && (
              <div>
                Última conexão: {formatDistanceToNow(new Date(lastHeartbeat), { addSuffix: true, locale: ptBR })}
              </div>
            )}
            {lastRestart && (
              <div>
                Último restart: {formatDistanceToNow(new Date(lastRestart), { addSuffix: true, locale: ptBR })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
