'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import { AlertTriangle, Activity } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';

interface PriorityChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

// Mapeamento de cores e configurações modernizadas para cada prioridade
const PRIORITY_CONFIG: {
  [key: string]: {
    color: string;
    gradient: string;
    label: string;
    icon: string;
  };
} = {
  LOW: {
    color: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-600',
    label: 'Baixa',
    icon: '🟢',
  },
  MEDIUM: {
    color: '#eab308',
    gradient: 'from-yellow-400 to-amber-600',
    label: 'Média',
    icon: '🟡',
  },
  HIGH: {
    color: '#f97316',
    gradient: 'from-orange-400 to-red-500',
    label: 'Alta',
    icon: '🟠',
  },
  URGENT: {
    color: '#ef4444',
    gradient: 'from-red-400 to-rose-600',
    label: 'Urgente',
    icon: '🔴',
  },
};

// Tooltip customizado modernizado
/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const config = PRIORITY_CONFIG[data.name] || PRIORITY_CONFIG.LOW;

    return (
      <div className="rounded-xl border-0 bg-white p-4 shadow-2xl backdrop-blur-sm dark:bg-slate-900">
        <div className="space-y-3">
          <div className="border-b border-slate-200 pb-2 dark:border-slate-700">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Prioridade
            </span>
          </div>

          <div className="space-y-2">
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

            <div className="flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Percentual
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {(data.percent * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Rótulo de percentagem customizado
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  /* eslint-disable @typescript-eslint/no-explicit-any */
}: any) => {
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
      className="text-xs font-bold drop-shadow-lg"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function PriorityChart({ data }: PriorityChartProps) {
  const chartData = data.filter((item) => item.total > 0);

  // Calcular totais
  const totalChamados = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const prioridadesCriticas = chartData
    .filter((item) => item.name === 'HIGH' || item.name === 'URGENT')
    .reduce((acc, curr) => acc + curr.total, 0);

  if (chartData.length === 0) {
    return (
      <Card className="relative overflow-hidden border-0 bg-white shadow-xl dark:bg-slate-900">
        <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-emerald-500" />
        <CardHeader>
          <CardTitle className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-slate-300">
            Chamados por Prioridade
          </CardTitle>
          <CardDescription className="text-sm">
            Distribuição dos chamados pelo nível de prioridade
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center">
          <div className="space-y-2 text-center">
            <Activity className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400">
              Não há dados de prioridade para exibir
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative min-h-[665px] overflow-hidden border-0 bg-white shadow-xl dark:bg-slate-900">
      {/* Gradient decorativo no topo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-orange-500 to-red-500" />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-lg font-bold text-transparent md:text-2xl dark:from-white dark:to-slate-300">
              Chamados por Prioridade
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Distribuição dos chamados pelo nível de prioridade
            </CardDescription>
          </div>

          {/* Badge com métrica de prioridades críticas */}
          {prioridadesCriticas > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-linear-to-br from-red-50 to-orange-50 px-3 py-1.5 dark:border-red-800 dark:from-red-950 dark:to-orange-950">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">
                Críticos
              </span>
              <span className="bg-linear-to-br from-red-600 to-orange-600 bg-clip-text text-sm font-bold text-transparent">
                {prioridadesCriticas}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Gráfico de Pizza */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <defs>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <linearGradient
                      key={key}
                      id={`gradient-priority-${key}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={config.color}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={config.color}
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  ))}
                </defs>

                <Tooltip content={<CustomTooltip />} />

                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={`url(#gradient-priority-${entry.name})`}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda Customizada Vertical */}
          <div className="w-full space-y-3 md:w-1/3">
            {chartData.map((entry) => {
              const config = PRIORITY_CONFIG[entry.name] || PRIORITY_CONFIG.LOW;
              const percentage = ((entry.total / totalChamados) * 100).toFixed(
                1,
              );

              return (
                <div
                  key={entry.name}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-3 transition-all hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:to-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full bg-linear-to-br ${config.gradient} shadow-lg transition-transform group-hover:scale-110`}
                        style={{ boxShadow: `0 4px 14px 0 ${config.color}30` }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {percentage}% do total
                        </span>
                      </div>
                    </div>
                    <span
                      className={`bg-linear-to-br ${config.gradient} bg-clip-text text-xl font-bold text-transparent`}
                    >
                      {entry.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-between rounded-xl border border-indigo-200 bg-linear-to-br from-indigo-50 to-purple-50 p-4 dark:border-indigo-800 dark:from-indigo-950 dark:to-purple-950">
            <div className="mb-1 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold tracking-wider text-indigo-700 md:uppercase dark:text-indigo-300">
                Total Geral
              </span>
            </div>
            <div className="bg-linear-to-br from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
              {totalChamados}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-red-200 bg-linear-to-br from-red-50 to-orange-50 p-4 dark:border-red-800 dark:from-red-950 dark:to-orange-950">
            <div className="mb-1 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold tracking-wider text-red-700 md:uppercase dark:text-red-300">
                Alta Prioridade
              </span>
            </div>
            <div className="bg-linear-to-br from-red-600 to-orange-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
              {prioridadesCriticas}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
