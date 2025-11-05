'use client';

import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  CartesianGrid,
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

// Props: O Server Component vai passar os dados já formatados
interface TrendChartProps {
  data: {
    month: string; // Ex: "Jan", "Fev"
    Novos: number;
    Resolvidos: number;
  }[];
}

// O componente de Tooltip customizado (como na sua imagem)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background rounded-lg border p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase">
              Mês: {label}
            </span>
          </div>
          <div />
          <div className="font-bold text-blue-500">Novos</div>
          <div className="text-right font-bold text-blue-500">
            {payload[0].value}
          </div>
          <div className="font-bold text-green-500">Resolvidos</div>
          <div className="text-right font-bold text-green-500">
            {payload[1].value}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Chamados (Últimos 12 Meses)</CardTitle>
        <CardDescription>
          Volume de chamados abertos vs. resolvidos ao longo do tempo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: -20, // Ajuste para o YAxis
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis
                dataKey="month" // O nosso 'month' formatado (ex: "Jan")
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              {/* O Tooltip customizado */}
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Linha 1: Novos */}
              <Line
                type="monotone"
                dataKey="Novos"
                stroke="#3b82f6" // Azul
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              {/* Linha 2: Resolvidos */}
              <Line
                type="monotone"
                dataKey="Resolvidos"
                stroke="#22c55e" // Verde
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
