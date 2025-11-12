import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Image, Video, Music, File, CheckCircle2, XCircle } from "lucide-react";

interface ReplicationLogsProps {
  configId: string;
}

interface Log {
  id: string;
  source_channel_id: number;
  destination_channel_id: number;
  message_type: string;
  status: string;
  error_message: string | null;
  replicated_at: string;
}

export const ReplicationLogs = ({ configId }: ReplicationLogsProps) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, successRate: 0 });

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("replication_logs")
        .select("*")
        .eq("config_id", configId)
        .order("replicated_at", { ascending: false })
        .limit(50);

      if (data) {
        setLogs(data);
        
        const total = data.length;
        const success = data.filter(l => l.status === 'success').length;
        const failed = data.filter(l => l.status === 'failed').length;
        const successRate = total > 0 ? (success / total) * 100 : 0;
        
        setStats({ total, success, failed, successRate });
      }
    };

    fetchLogs();

    // Subscribe to new logs
    const channel = supabase
      .channel('replication_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'replication_logs',
          filter: `config_id=eq.${configId}`,
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [configId]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'photo': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard de Logs</CardTitle>
        <CardDescription>Histórico de replicações de mensagens</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-success/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Sucesso</p>
            <p className="text-2xl font-bold text-success">{stats.success}</p>
          </div>
          <div className="bg-destructive/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Falhas</p>
            <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
            <p className="text-2xl font-bold text-primary">{stats.successRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum log de replicação ainda. Aguardando mensagens...
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.replicated_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMessageIcon(log.message_type)}
                        <span className="capitalize">{log.message_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.source_channel_id}</TableCell>
                    <TableCell className="font-mono text-xs">{log.destination_channel_id}</TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <Badge variant="default" className="bg-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Sucesso
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Falha
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
