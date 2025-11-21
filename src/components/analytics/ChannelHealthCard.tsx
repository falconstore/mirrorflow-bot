import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChannelHealthProps {
  logs: Array<{
    destination_channel_id: number;
    status: string;
    replicated_at: string;
  }>;
}

export const ChannelHealthCard = ({ logs }: ChannelHealthProps) => {
  // Group by channel
  const channelStats: Record<number, {
    total: number;
    success: number;
    failed: number;
    lastMessage: string;
  }> = {};

  logs.forEach(log => {
    const channelId = log.destination_channel_id;
    if (!channelStats[channelId]) {
      channelStats[channelId] = {
        total: 0,
        success: 0,
        failed: 0,
        lastMessage: log.replicated_at,
      };
    }
    
    channelStats[channelId].total++;
    if (log.status === 'success') {
      channelStats[channelId].success++;
    } else {
      channelStats[channelId].failed++;
    }
    
    // Update last message if this one is more recent
    if (new Date(log.replicated_at) > new Date(channelStats[channelId].lastMessage)) {
      channelStats[channelId].lastMessage = log.replicated_at;
    }
  });

  // Calculate success rates and sort
  const channelsWithHealth = Object.entries(channelStats).map(([channelId, stats]) => ({
    channelId: parseInt(channelId),
    successRate: (stats.success / stats.total) * 100,
    total: stats.total,
    failed: stats.failed,
    lastMessage: stats.lastMessage,
  })).sort((a, b) => b.successRate - a.successRate);

  const getHealthBadge = (successRate: number) => {
    if (successRate >= 95) return { variant: "default" as const, label: "Excelente", icon: CheckCircle };
    if (successRate >= 80) return { variant: "secondary" as const, label: "Bom", icon: CheckCircle };
    return { variant: "destructive" as const, label: "Atenção", icon: AlertTriangle };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          Saúde dos Canais
        </CardTitle>
      </CardHeader>
      <CardContent>
        {channelsWithHealth.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum canal registrado ainda
          </div>
        ) : (
          <div className="space-y-3">
            {channelsWithHealth.map(channel => {
              const health = getHealthBadge(channel.successRate);
              const HealthIcon = health.icon;
              
              return (
                <div key={channel.channelId} className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Canal {channel.channelId}</span>
                    </div>
                    <Badge variant={health.variant} className="gap-1">
                      <HealthIcon className="w-3 h-3" />
                      {health.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">{channel.successRate.toFixed(1)}%</span> sucesso
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{channel.total}</span> mensagens
                    </div>
                    <div>
                      {channel.failed > 0 && (
                        <span className="text-destructive font-medium">{channel.failed} erros</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    Última mensagem: {formatDistanceToNow(new Date(channel.lastMessage), { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
