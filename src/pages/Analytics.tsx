import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MessageSquare, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MessagesPerHourChart } from "@/components/analytics/MessagesPerHourChart";
import { MessageTypesChart } from "@/components/analytics/MessageTypesChart";
import { ChannelPerformanceChart } from "@/components/analytics/ChannelPerformanceChart";
import { WeeklyTrendChart } from "@/components/analytics/WeeklyTrendChart";

interface Log {
  id: string;
  config_id: string;
  source_channel_id: number;
  destination_channel_id: number;
  replicated_at: string;
  status: string;
  error_message: string | null;
  message_type: string;
}

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);
  const [period, setPeriod] = useState("24h");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (configId) {
      fetchLogs();
    }
  }, [configId, period]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: configs } = await supabase
      .from("telegram_configs")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (configs) {
      setConfigId(configs.id);
    } else {
      toast({
        title: "Configuração não encontrada",
        description: "Configure seus canais primeiro",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const fetchLogs = async () => {
    if (!configId) return;

    setLoading(true);
    const now = new Date();
    let startDate;

    if (period === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === "7days") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { data, error } = await supabase
      .from("replication_logs")
      .select("*")
      .eq("config_id", configId)
      .gte("replicated_at", startDate?.toISOString())
      .order("replicated_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar logs",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLogs(data || []);
    }

    setLoading(false);
  };

  const totalMessages = logs.length;
  const successMessages = logs.filter((l) => l.status === "success").length;
  const successRate = totalMessages > 0 ? (successMessages / totalMessages) * 100 : 0;
  const messagesPerHour = period === "24h" ? Math.round(totalMessages / 24) : Math.round(totalMessages / (parseInt(period) || 24));

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">📊 Estatísticas Avançadas</h1>
          <p className="text-muted-foreground">Análise detalhada das suas replicações</p>
        </div>

        {/* Filtros de Período */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={period === "today" ? "default" : "outline"}
            onClick={() => setPeriod("today")}
          >
            Hoje
          </Button>
          <Button
            variant={period === "24h" ? "default" : "outline"}
            onClick={() => setPeriod("24h")}
          >
            24 horas
          </Button>
          <Button
            variant={period === "7days" ? "default" : "outline"}
            onClick={() => setPeriod("7days")}
          >
            7 dias
          </Button>
          <Button
            variant={period === "30days" ? "default" : "outline"}
            onClick={() => setPeriod("30days")}
          >
            30 dias
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                {period === "24h" ? "Últimas 24 horas" : period === "7days" ? "Últimos 7 dias" : period === "30days" ? "Últimos 30 dias" : "Hoje"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${successRate > 95 ? "text-green-600" : successRate > 90 ? "text-yellow-600" : "text-red-600"}`}>
                {successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {successMessages} de {totalMessages} entregas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens por Hora</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">~{messagesPerHour}</div>
              <p className="text-xs text-muted-foreground">Média horária</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Mensagens por Hora */}
        {period === "24h" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>📈 Mensagens por Hora</CardTitle>
              <CardDescription>Distribuição nas últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <MessagesPerHourChart logs={logs} />
            </CardContent>
          </Card>
        )}

        {/* Gráficos em Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>🎨 Tipos de Mensagem</CardTitle>
              <CardDescription>Distribuição por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <MessageTypesChart logs={logs} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ Performance dos Canais</CardTitle>
              <CardDescription>Top 10 canais mais ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <ChannelPerformanceChart logs={logs} configId={configId} />
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Tendência Semanal */}
        {(period === "7days" || period === "30days") && (
          <Card>
            <CardHeader>
              <CardTitle>📅 Tendência ao Longo do Tempo</CardTitle>
              <CardDescription>Histórico de replicações</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyTrendChart logs={logs} period={period} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
