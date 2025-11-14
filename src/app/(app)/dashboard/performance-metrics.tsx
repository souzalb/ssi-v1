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
  Zap,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Numerals } from 'react-day-picker';

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
  progress?: number;
}

interface PerformanceMetricsProps {
  avgTime: string;
  averageSatisfaction: string | number;
  slaRate: string;
  totalRatings: number;
  totalTickets: number;
  trends?: {
    avgTime?: number;
    satisfaction?: number;
    slaRate?: number;
    ratings?: number;
  };
  insights?: {
    fastestTime?: string;
    bestRating?: number;
    slaCompliance?: string;
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
  progress,
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
    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-linear-to-br from-slate-50 to-white p-0 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl dark:from-slate-900/80 dark:to-slate-800/80">
      {/* Gradient decorativo */}
      <div
        className={`absolute top-0 right-0 left-0 h-1 rounded-t-2xl bg-linear-to-r ${gradient}`}
      />

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Ícone */}
          <div
            className={`rounded-xl ${iconBg} p-2 shadow-lg backdrop-blur-xl transition-transform group-hover:scale-110 md:p-3`}
          >
            <Icon className="h-3 w-3 text-white drop-shadow-sm md:h-5 md:w-5" />
          </div>

          {/* Trend badge */}
          {trend && (
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold backdrop-blur-xl ${getTrendColor()} bg-slate-100/80 dark:bg-slate-800/80`}
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
            className={`h-full bg-linear-to-r ${gradient} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de Insight Card
const InsightCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  gradient,
}: {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  gradient: string;
}) => {
  return (
    <div className="group relative overflow-hidden rounded-xl border-0 bg-linear-to-br from-slate-50/80 to-white/80 p-4 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl dark:from-slate-900/60 dark:to-slate-800/60">
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-5`}
      />
      <div className="relative flex items-center gap-3">
        <div
          className={`rounded-lg ${iconBg} p-2 shadow-lg backdrop-blur-xl transition-transform group-hover:scale-110`}
        >
          <Icon className={`h-4 w-4 ${iconColor} drop-shadow-sm`} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente principal
export function PerformanceMetrics({
  avgTime,
  averageSatisfaction,
  slaRate,
  totalRatings,
  totalTickets,
  trends,
  insights,
}: PerformanceMetricsProps) {
  // Formata a satisfação
  const satisfactionValue =
    averageSatisfaction === 'N/A'
      ? 'N/A'
      : typeof averageSatisfaction === 'number'
        ? averageSatisfaction.toFixed(1)
        : averageSatisfaction;

  const satisfactionSuffix = averageSatisfaction !== 'N/A' ? '/5.0' : '';
  const ratingSuffix = '/' + String(totalTickets);

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

  // Valores padrão para insights se não fornecidos
  const fastestTime = insights?.fastestTime || avgTime;
  const bestRating =
    insights?.bestRating ||
    (typeof averageSatisfaction === 'number' ? averageSatisfaction : 0);
  const slaCompliance = insights?.slaCompliance || slaRate;

  //bar-progress
  const avgTimeProgress = (() => {
    const minutes = parseInt(avgTime.replace('min', ''));
    const max = 120; // 2 horas como pior cenário
    return Math.min((1 - minutes / max) * 100, 100);
  })();

  const ratingsProgress = Math.min((totalRatings / totalTickets) * 100, 100);

  return (
    <Card className="relative min-h-[620px] overflow-hidden border-0 bg-white shadow-2xl backdrop-blur-xl dark:bg-slate-900">
      {/* Gradient decorativo no topo */}
      <div className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl bg-linear-to-r from-blue-500 via-purple-500 to-emerald-500" />
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

          {/* Badge de resumo */}
          <div className="hidden items-center gap-2 rounded-2xl border border-emerald-200/60 bg-linear-to-br from-emerald-50/80 to-teal-50/80 px-4 py-2 backdrop-blur-xl md:flex dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-teal-950/40">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
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
                      type: getTrendType(trends.avgTime, false),
                    }
                  : undefined
              }
              progress={avgTimeProgress}
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
                      type: getTrendType(trends.satisfaction, true),
                    }
                  : undefined
              }
              progress={
                averageSatisfaction === 'N/A'
                  ? 0
                  : (Number(averageSatisfaction) / 5) * 100
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
                      type: getTrendType(trends.slaRate, true),
                    }
                  : undefined
              }
              progress={Number(slaRate.replace('%', ''))}
            />

            <MetricCard
              title="Total de Avaliações"
              value={totalRatings.toLocaleString('pt-BR')}
              suffix={ratingSuffix}
              icon={MessageSquare}
              gradient="from-purple-400 to-pink-600"
              iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
              trend={
                trends?.ratings !== undefined
                  ? {
                      value: Math.abs(trends.ratings),
                      type: getTrendType(trends.ratings, true),
                    }
                  : undefined
              }
              progress={ratingsProgress}
            />
          </div>

          {/* Cards de insights adicionais */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InsightCard
              icon={Zap}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-100/80 dark:bg-blue-900/40"
              label="Tempo mais rápido"
              value={fastestTime}
              gradient="from-blue-500 to-indigo-600"
            />

            <InsightCard
              icon={Star}
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-100/80 dark:bg-amber-900/40"
              label="Melhor avaliação"
              value={bestRating > 0 ? `${bestRating.toFixed(1)} ⭐` : 'N/A'}
              gradient="from-amber-500 to-orange-600"
            />

            <InsightCard
              icon={CalendarCheck}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-100/80 dark:bg-emerald-900/40"
              label="Dentro do SLA"
              value={slaCompliance}
              gradient="from-emerald-500 to-teal-600"
            />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
