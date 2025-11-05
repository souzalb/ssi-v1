'use client';

import { Status } from '@prisma/client';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
} from 'recharts';

// Importa os componentes do shadcn para o "invólucro"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card'; // (Ajuste o caminho se necessário)

// O tipo de dados que o gráfico espera (vem do Server Component)
type StatusChartData = {
  [K in Status]: number;
};

interface StatusChartProps {
  data: StatusChartData;
}

export function StatusChart({ data }: StatusChartProps) {
  // 1. Transformar os dados
  // O Recharts espera um array de objetos, ex: [{ name: 'OPEN', total: 5 }, ...]
  // Filtramos os status que não têm chamados (total: 0)
  const chartData = Object.entries(data)
    .map(([name, total]) => ({
      name,
      total,
    }))
    .filter((item) => item.total > 0);

  // Se não houver dados (ex: 0 chamados), não renderiza o gráfico
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chamados por Status</CardTitle>
          <CardDescription>
            Análise da distribuição de todos os chamados na sua fila.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center">
          <p className="text-muted-foreground">
            Não há dados suficientes para exibir o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chamados por Status</CardTitle>
        <CardDescription>
          Análise da distribuição de todos os chamados na sua fila.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* O ResponsiveContainer faz o gráfico ter 100% da largura do pai */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: -20, // Ajuste para o YAxis
                bottom: 5,
              }}
            >
              {/* Grelha de fundo (opcional) */}
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />

              {/* Eixo X (os nomes dos status) */}
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              {/* Eixo Y (a contagem) */}
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false} // Não permite números quebrados (ex: 1.5)
              />
              {/* Tooltip (o que aparece ao passar o rato) */}
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              {/* As Barras */}
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))" // Usa a cor primária do shadcn
                radius={[4, 4, 0, 0]} // Cantos arredondados no topo
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
