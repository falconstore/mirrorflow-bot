import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Log {
  message_type: string;
}

interface Props {
  logs: Log[];
}

const COLORS = {
  text: "#3B82F6",
  photo: "#10B981",
  video: "#F59E0B",
  audio: "#8B5CF6",
  document: "#6B7280",
};

const TYPE_LABELS = {
  text: "📝 Texto",
  photo: "🖼️ Foto",
  video: "🎥 Vídeo",
  audio: "🎵 Áudio",
  document: "📎 Documento",
};

export const MessageTypesChart = ({ logs }: Props) => {
  const getMessageTypeStats = () => {
    const types = logs.reduce((acc, log) => {
      acc[log.message_type] = (acc[log.message_type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return Object.entries(types).map(([type, count]) => ({
      name: TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type,
      value: count,
      fill: COLORS[type as keyof typeof COLORS] || "#6B7280"
    }));
  };

  const data = getMessageTypeStats();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px"
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
