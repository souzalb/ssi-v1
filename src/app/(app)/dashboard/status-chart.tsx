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
  Cell,
} from 'recharts';

import { Activity } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';

type StatusChartData = {
  [K in Status]: number;
};

interface StatusChartProps {
  data: StatusChartData;
}

// Mapeamento de cores e labels modernos para cada status
const STATUS_CONFIG: Record<
  Status,
  { color: string; gradient: string; label: string }
> = {
  OPEN: {
    color: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-600',
    label: 'Abertos',
  },
  IN_PROGRESS: {
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-600',
    label: 'Em Progresso',
  },
  ASSIGNED: {
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-purple-600',
    label: 'Atribuídos',
  },
  ON_HOLD: {
    color: '#ec4899',
    gradient: 'from-pink-400 to-rose-600',
    label: 'Em Espera',
  },
  RESOLVED: {
    color: '#10b981',
    gradient: 'from-emerald-400 to-teal-600',
    label: 'Resolvidos',
  },
  CLOSED: {
    color: '#6366f1',
    gradient: 'from-indigo-400 to-purple-600',
    label: 'Fechados',
  },
  CANCELLED: {
    color: '#ef4444',
    gradient: 'from-red-400 to-rose-600',
    label: 'Cancelados',
  },
};

// Tooltip customizado modernizado
/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const config = STATUS_CONFIG[data.name as Status];

    return (
      <div className="rounded-xl border-0 bg-white p-4 shadow-2xl backdrop-blur-sm dark:bg-slate-900">
        <div className="space-y-3">
          <div className="border-b border-slate-200 pb-2 dark:border-slate-700">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Status
            </span>
          </div>

          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full bg-linear-to-br ${config.gradient}`}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {config.label}
              </span>
            </div>
            <span
              className={`bg-linear-to-br ${config.gradient} bg-clip-text text-lg font-bold text-transparent`}
            >
              {data.total}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function StatusChart({ data }: StatusChartProps) {
  // Transformar e filtrar os dados
  const chartData = Object.entries(data)
    .map(([name, total]) => ({
      name: name as Status,
      total,
    }))
    .filter((item) => item.total > 0);

  // Calcular totais
  const totalChamados = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const statusAtivos = chartData.length;

  if (chartData.length === 0) {
    return (
      <Card className="relative overflow-hidden border-0 bg-white shadow-xl dark:bg-slate-900">
        <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-emerald-500" />
        <CardHeader>
          <CardTitle className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-slate-300">
            Chamados por Status
          </CardTitle>
          <CardDescription className="text-sm">
            Análise da distribuição de todos os chamados na sua fila
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center">
          <div className="space-y-2 text-center">
            <Activity className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400">
              Não há dados suficientes para exibir o gráfico
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-white shadow-xl dark:bg-slate-900">
      {/* Gradient decorativo no topo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-emerald-500" />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-slate-300">
              Chamados por Status
            </CardTitle>
            <CardDescription className="text-sm">
              Análise da distribuição de todos os chamados na sua fila
            </CardDescription>
          </div>

          {/* Badge com métrica */}
          <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-linear-to-br from-indigo-50 to-purple-50 px-3 py-1.5 dark:border-indigo-800 dark:from-indigo-950 dark:to-purple-950">
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              Total de Status
            </span>
            <span className="bg-linear-to-br from-indigo-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent">
              {statusAtivos}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 10,
              }}
            >
              <defs>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <linearGradient
                    key={status}
                    id={`gradient-${status}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={config.color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={config.color}
                      stopOpacity={0.3}
                    />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                strokeOpacity={0.1}
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
                tickFormatter={(value) => STATUS_CONFIG[value as Status].label}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />

              <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#gradient-${entry.name})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cards de métricas */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-purple-200 bg-linear-to-br from-purple-50 to-indigo-50 p-4 dark:border-purple-800 dark:from-purple-950 dark:to-indigo-950">
            <div className="mb-1 flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold tracking-wider text-purple-700 uppercase dark:text-purple-300">
                Total de Chamados
              </span>
            </div>
            <div className="bg-linear-to-br from-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
              {totalChamados}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-gray-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-gray-900">
            <div className="mb-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-500" />
              <span className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Média por Status
              </span>
            </div>
            <div className="bg-linear-to-br from-slate-600 to-gray-600 bg-clip-text text-2xl font-bold text-transparent">
              {(totalChamados / statusAtivos).toFixed(1)}
            </div>
          </div>
        </div>

        {/* Legend customizada */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {chartData.map((item) => {
            const config = STATUS_CONFIG[item.name];
            return (
              <div
                key={item.name}
                className="group flex cursor-pointer items-center gap-2"
              >
                <div
                  className={`h-3 w-3 rounded-full bg-linear-to-br ${config.gradient} shadow-lg transition-transform group-hover:scale-125`}
                  style={{ boxShadow: `0 4px 14px 0 ${config.color}30` }}
                />
                <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                  {config.label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  ({item.total})
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
