'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

// Importa os componentes do shadcn para o "invólucro"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card'; // (Ajuste o caminho se necessário)

// Props (sem alteração)
interface AreaChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// 1. Paleta de cores (sem alteração)
const COLORS = [
  '#0088FE', // Azul
  '#00C49F', // Verde
  '#FFBB28', // Amarelo
  '#FF8042', // Laranja
  '#AF19FF', // Roxo
];

// --- 2. Tooltip Customizado (sem alteração) ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background rounded-lg border p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="col-span-2 mb-1">
            <span className="text-foreground text-sm font-semibold">
              {data.name}
            </span>
          </div>
          <div className="text-muted-foreground text-sm">Chamados</div>
          <span className="text-foreground text-right text-sm font-semibold">
            {data.total}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// --- 3. Legenda Customizada (sem alteração) ---
const CustomLegend = (props: any) => {
  const { payload } = props;
  if (!payload || payload.length === 0) return null;

  return (
    <div className="flex flex-col space-y-2">
      {payload.map((entry: any, index: number) => (
        <div
          key={`item-${index}`}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground text-sm">{entry.value}</span>
          </div>
          <span className="text-foreground text-sm font-semibold">
            {entry.payload.total}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- 4. Rótulo de Percentagem (sem alteração) ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  // ... (lógica de cálculo do rótulo)
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function AreaChart({ data }: AreaChartProps) {
  const chartData = data.filter((item) => item.total > 0);

  if (chartData.length === 0) {
    // ... (O seu "empty state" Card)
    return (
      <Card>
        {/* ... (CardHeader) ... */}
        <CardContent className="flex h-[350px] items-center justify-center">
          <p className="text-muted-foreground">
            Não há dados de chamados por área para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chamados por Área</CardTitle>
        <CardDescription>
          Distribuição de todos os chamados por departamento.
        </CardDescription>
      </CardHeader>

      {/* --- 5. LAYOUT RESPONSIVO ATUALIZADO --- */}
      <CardContent>
        {/* Mobile (padrão): 'grid-cols-1'. Altura automática.
          Desktop ('md:'): 'grid-cols-2'. Altura fixa de 350px.
        */}
        <div className="grid grid-cols-1 gap-4 md:h-[350px] md:grid-cols-2">
          {/* Coluna 1: O Gráfico */}
          {/* Mobile: 'h-[300px]' (altura fixa para o gráfico no telemóvel)
            Desktop: 'h-full' (preenche os 350px do 'pai')
          */}
          <div className="h-[300px] w-full md:h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={140}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                {/* Esconde a legenda original */}
                <Legend content={(props: any) => null} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Coluna 2: A Legenda Customizada */}
          {/* Mobile: 'h-auto' (altura automática, flui abaixo do gráfico)
            Desktop: 'h-full' (preenche os 350px e centra o conteúdo)
          */}
          <div className="flex flex-col justify-center space-y-4 md:h-full">
            <CustomLegend
              payload={chartData.map((entry, index) => ({
                value: entry.name,
                color: COLORS[index % COLORS.length],
                payload: entry, // Passa os dados completos (para o 'total')
              }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
