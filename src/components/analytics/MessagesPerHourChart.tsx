import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Log {
  replicated_at: string;
}

interface Props {
  logs: Log[];
}

export const MessagesPerHourChart = ({ logs }: Props) => {
  const groupByHour = () => {
    const hourlyData: { [key: string]: number } = {};
    
    logs.forEach(log => {
      const hour = new Date(log.replicated_at).getHours();
      const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
      hourlyData[hourLabel] = (hourlyData[hourLabel] || 0) + 1;
    });
    
    const now = new Date();
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourLabel = `${hour.getHours().toString().padStart(2, '0')}:00`;
      data.push({
        hour: hourLabel,
        messages: hourlyData[hourLabel] || 0
      });
    }
    
    return data;
  };

  const data = groupByHour();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="hour" 
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
        <Area 
          type="monotone" 
          dataKey="messages" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorMessages)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
