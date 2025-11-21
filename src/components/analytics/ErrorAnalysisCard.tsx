import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ErrorAnalysisProps {
  logs: Array<{
    status: string;
    error_message: string | null;
    replicated_at: string;
    destination_channel_id: number;
  }>;
}

export const ErrorAnalysisCard = ({ logs }: ErrorAnalysisProps) => {
  const errorLogs = logs.filter(log => log.status === 'failed');
  const errorRate = logs.length > 0 ? (errorLogs.length / logs.length) * 100 : 0;
  
  // Group errors by type
  const errorsByType: Record<string, number> = {};
  errorLogs.forEach(log => {
    const errorType = log.error_message?.split(':')[0] || 'Unknown Error';
    errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
  });
  
  // Group errors by channel
  const errorsByChannel: Record<number, number> = {};
  errorLogs.forEach(log => {
    errorsByChannel[log.destination_channel_id] = (errorsByChannel[log.destination_channel_id] || 0) + 1;
  });
  
  const topErrorTypes = Object.entries(errorsByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  const topErrorChannels = Object.entries(errorsByChannel)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Calculate trend (last 10% vs previous)
  const recentCount = Math.floor(logs.length * 0.1);
  const recentErrors = logs.slice(-recentCount).filter(l => l.status === 'failed').length;
  const previousErrors = logs.slice(-recentCount * 2, -recentCount).filter(l => l.status === 'failed').length;
  const trend = previousErrors > 0 ? ((recentErrors - previousErrors) / previousErrors) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Análise de Erros
          </CardTitle>
          <Badge variant={errorRate > 10 ? "destructive" : errorRate > 5 ? "default" : "secondary"}>
            {errorRate.toFixed(1)}% taxa de erro
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tendência</span>
            <div className="flex items-center gap-1">
              {trend > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">+{trend.toFixed(0)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-success" />
                  <span className="text-success">{trend.toFixed(0)}%</span>
                </>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {errorLogs.length} erros de {logs.length} mensagens
          </div>
        </div>

        {topErrorTypes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Principais Tipos de Erro</h4>
            {topErrorTypes.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[200px]">{type}</span>
                <Badge variant="outline">{count}x</Badge>
              </div>
            ))}
          </div>
        )}

        {topErrorChannels.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Canais com Mais Problemas</h4>
            {topErrorChannels.map(([channelId, count]) => (
              <div key={channelId} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Canal {channelId}</span>
                <Badge variant="destructive">{count} erros</Badge>
              </div>
            ))}
          </div>
        )}

        {errorLogs.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            🎉 Nenhum erro registrado!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
