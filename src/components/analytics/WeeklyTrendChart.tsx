import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Log {
  replicated_at: string;
  status: string;
}

interface Props {
  logs: Log[];
  period: string;
}

export const WeeklyTrendChart = ({ logs, period }: Props) => {
  const getWeeklyTrend = () => {
    const now = new Date();
    const data = [];
    const days = period === "7days" ? 7 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.replicated_at);
        return logDate.toDateString() === date.toDateString();
      });
      
      data.push({
        day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: dayLogs.length,
        sucesso: dayLogs.filter(l => l.status === "success").length,
        falha: dayLogs.filter(l => l.status === "failed").length
      });
    }
    
    return data;
  };

  const data = getWeeklyTrend();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="day"
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
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
        <Legend />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          name="Total"
        />
        <Line 
          type="monotone" 
          dataKey="sucesso" 
          stroke="#10B981" 
          strokeWidth={2}
          name="Sucesso"
        />
        <Line 
          type="monotone" 
          dataKey="falha" 
          stroke="#EF4444" 
          strokeWidth={2}
          name="Falha"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
