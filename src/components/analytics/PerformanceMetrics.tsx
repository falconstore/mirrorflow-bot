import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PerformanceMetricsProps {
  logs: Array<{
    replicated_at: string;
    status: string;
    message_type: string;
  }>;
}

export const PerformanceMetrics = ({ logs }: PerformanceMetricsProps) => {
  // Calculate messages per minute
  if (logs.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          Aguardando mais dados para análise...
        </CardContent>
      </Card>
    );
  }

  const firstLog = new Date(logs[0].replicated_at);
  const lastLog = new Date(logs[logs.length - 1].replicated_at);
  const timeRangeMinutes = (lastLog.getTime() - firstLog.getTime()) / (1000 * 60);
  const messagesPerMinute = timeRangeMinutes > 0 ? logs.length / timeRangeMinutes : 0;

  // Calculate messages per hour
  const messagesPerHour = messagesPerMinute * 60;

  // Find peak period (divide into 10-minute buckets)
  const buckets: Record<string, number> = {};
  logs.forEach(log => {
    const time = new Date(log.replicated_at);
    const bucketKey = `${time.getHours()}:${Math.floor(time.getMinutes() / 10) * 10}`;
    buckets[bucketKey] = (buckets[bucketKey] || 0) + 1;
  });

  const peakBucket = Object.entries(buckets).sort(([, a], [, b]) => b - a)[0];
  
  // Most common message type
  const messageTypes: Record<string, number> = {};
  logs.forEach(log => {
    messageTypes[log.message_type] = (messageTypes[log.message_type] || 0) + 1;
  });
  
  const mostCommonType = Object.entries(messageTypes)
    .sort(([, a], [, b]) => b - a)[0];

  // Calculate success rate
  const successfulLogs = logs.filter(log => log.status === 'success');
  const successRate = (successfulLogs.length / logs.length) * 100;

  // Time since last message
  const timeSinceLast = formatDistanceToNow(lastLog, { addSuffix: true, locale: ptBR });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Métricas de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Zap className="w-4 h-4" />
              Velocidade Média
            </div>
            <div className="text-2xl font-bold">{messagesPerMinute.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">msgs/minuto</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Activity className="w-4 h-4" />
              Por Hora
            </div>
            <div className="text-2xl font-bold">{messagesPerHour.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">msgs/hora</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              Última Mensagem
            </div>
            <div className="text-sm font-medium">{timeSinceLast}</div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">Taxa de Sucesso</div>
            <div className="text-2xl font-bold text-success">{successRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Horário de Pico</span>
            <span className="font-medium">{peakBucket?.[0]} ({peakBucket?.[1]} msgs)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tipo Mais Comum</span>
            <span className="font-medium capitalize">{mostCommonType?.[0]} ({mostCommonType?.[1]})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
