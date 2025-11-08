'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import {
  Timer,
  Star,
  CalendarCheck,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  trend?: {
    value: number;
    type: 'up' | 'down' | 'neutral';
  };
  suffix?: string;
}

interface PerformanceMetricsProps {
  avgTime: string;
  averageSatisfaction: string | number;
  slaRate: string;
  totalRatings: number;
  trends?: {
    avgTime?: number;
    satisfaction?: number;
    slaRate?: number;
    ratings?: number;
  };
}

// Componente individual de métrica
const MetricCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  iconBg,
  trend,
  suffix = '',
}: MetricCardProps) => {
  const getTrendIcon = () => {
    if (!trend) return null;

    const iconClass = 'h-3 w-3';
    if (trend.type === 'up') return <TrendingUp className={iconClass} />;
    if (trend.type === 'down') return <TrendingDown className={iconClass} />;
    return <Minus className={iconClass} />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.type === 'up') return 'text-emerald-600 dark:text-emerald-400';
    if (trend.type === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <Card className="group relative overflow-hidden rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-0 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
      {/* Gradient decorativo */}
      <div
        className={`absolute top-0 right-0 left-0 h-1 bg-linear-to-r ${gradient}`}
      />

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Ícone */}
          <div
            className={`rounded-xl ${iconBg} p-2 shadow-lg transition-transform group-hover:scale-110 md:p-3`}
          >
            <Icon className="h-3 w-3 text-white md:h-5 md:w-5" />
          </div>

          {/* Trend badge */}
          {trend && (
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getTrendColor()} bg-slate-100 dark:bg-slate-800`}
            >
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Valor principal */}
        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span
              className={`bg-linear-to-br ${gradient} bg-clip-text text-xl font-bold text-transparent md:text-3xl`}
            >
              {value}
            </span>
            {suffix && (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {suffix}
              </span>
            )}
          </div>

          {/* Título */}
          <p className="mt-2 text-xs font-medium text-slate-600 md:text-sm dark:text-slate-400">
            {title}
          </p>
        </div>

        {/* Barra de progresso decorativa */}
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full bg-linear-to-r ${gradient} transition-all duration-1000 ease-out group-hover:w-full`}
            style={{ width: '60%' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal
export function PerformanceMetrics({
  avgTime,
  averageSatisfaction,
  slaRate,
  totalRatings,
  trends,
}: PerformanceMetricsProps) {
  // Formata a satisfação
  const satisfactionValue =
    averageSatisfaction === 'N/A'
      ? 'N/A'
      : typeof averageSatisfaction === 'number'
        ? averageSatisfaction.toFixed(1)
        : averageSatisfaction;

  const satisfactionSuffix = averageSatisfaction !== 'N/A' ? '/5.0' : '';

  // Helper para determinar tipo de trend baseado na métrica
  const getTrendType = (
    value: number,
    isPositiveBetter: boolean,
  ): 'up' | 'down' | 'neutral' => {
    if (value === 0) return 'neutral';
    if (isPositiveBetter) {
      return value > 0 ? 'up' : 'down';
    } else {
      return value > 0 ? 'down' : 'up';
    }
  };

  return (
    <Card className="relative min-h-[620px] overflow-hidden border-0 bg-white shadow-xl dark:bg-slate-900">
      {/* Gradient decorativo no topo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-emerald-500" />
      <div className="space-y-6">
        {/* Header da seção */}
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>
              <h2 className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-lg font-bold text-transparent md:text-2xl dark:from-white dark:to-slate-300">
                Métricas de Performance
              </h2>
            </CardTitle>
            <CardDescription className="text-sm md:text-sm">
              Acompanhe os principais indicadores do seu time
            </CardDescription>
          </div>

          {/* Badge de resumo opcional */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 px-4 py-2 md:flex dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Atualizado agora
            </span>
          </div>
        </CardHeader>

        {/* Grid de métricas */}
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Tempo Médio de Resolução"
              value={avgTime}
              icon={Timer}
              gradient="from-blue-400 to-indigo-600"
              iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
              trend={
                trends?.avgTime !== undefined
                  ? {
                      value: Math.abs(trends.avgTime),
                      type: getTrendType(trends.avgTime, false), // menor tempo é melhor
                    }
                  : undefined
              }
            />

            <MetricCard
              title="Satisfação Média"
              value={satisfactionValue}
              suffix={satisfactionSuffix}
              icon={Star}
              gradient="from-amber-400 to-orange-600"
              iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
              trend={
                trends?.satisfaction !== undefined
                  ? {
                      value: Math.abs(trends.satisfaction),
                      type: getTrendType(trends.satisfaction, true), // maior satisfação é melhor
                    }
                  : undefined
              }
            />

            <MetricCard
              title="Taxa de Resolução (SLA)"
              value={slaRate}
              icon={CalendarCheck}
              gradient="from-emerald-400 to-teal-600"
              iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
              trend={
                trends?.slaRate !== undefined
                  ? {
                      value: Math.abs(trends.slaRate),
                      type: getTrendType(trends.slaRate, true), // maior taxa SLA é melhor
                    }
                  : undefined
              }
            />

            <MetricCard
              title="Total de Avaliações"
              value={totalRatings.toLocaleString('pt-BR')}
              icon={MessageSquare}
              gradient="from-purple-400 to-pink-600"
              iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
              trend={
                trends?.ratings !== undefined
                  ? {
                      value: Math.abs(trends.ratings),
                      type: getTrendType(trends.ratings, true), // mais avaliações é melhor
                    }
                  : undefined
              }
            />
          </div>

          {/* Cards de insights adicionais (opcional) */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Tempo mais rápido
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    15 min
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                  <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Melhor avaliação
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    5.0 ⭐
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                  <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Dentro do SLA
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    95%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
