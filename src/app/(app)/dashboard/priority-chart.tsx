'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend, // Vamos adicionar uma legenda
} from 'recharts';

// Importa os componentes do shadcn para o "invólucro"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card'; // (Ajuste o caminho se necessário)

// Props: O Server Component vai passar os dados já formatados
interface PriorityChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

// 1. Mapeamento de Cores para as Prioridades
// (Pode personalizar estas cores)
const COLORS: { [key: string]: string } = {
  LOW: '#3b82f6', // Azul (blue-500)
  MEDIUM: '#eab308', // Amarelo (yellow-500)
  HIGH: '#f97316', // Laranja (orange-500)
  URGENT: '#ef4444', // Vermelho (red-500)
};

export function PriorityChart({ data }: PriorityChartProps) {
  // 2. Filtramos os dados (não mostramos prioridades com 0 chamados)
  const chartData = data.filter((item) => item.total > 0);

  // 3. Se não houver dados nenhuns
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chamados por Prioridade</CardTitle>
          <CardDescription>
            Distribuição dos chamados pelo nível de prioridade.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center">
          <p className="text-muted-foreground">
            Não há dados de prioridade para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chamados por Prioridade</CardTitle>
        <CardDescription>
          Distribuição dos chamados pelo nível de prioridade.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Tooltip (o que aparece ao passar o rato) */}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              {/* Legenda (em baixo do gráfico) */}
              <Legend />
              {/* O Gráfico de Pizza */}
              <Pie
                data={chartData}
                dataKey="total" // O valor (ex: 5)
                nameKey="name" // O nome (ex: "HIGH")
                cx="50%"
                cy="50%"
                outerRadius={120} // Tamanho do gráfico
                fill="#8884d8"
                labelLine={false}
                // Mostra a percentagem na própria fatia
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={(props: any) => `${(props.percent * 100).toFixed(0)}%`}
              >
                {/* Aplica as cores corretas a cada fatia */}
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || '#8884d8'}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
