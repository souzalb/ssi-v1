'use client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useMemo } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  // Define temas baseados no título
  const theme = useMemo(() => {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('total')) {
      return {
        gradient: 'from-slate-500 via-slate-600 to-slate-700',
        iconBg: 'bg-slate-500/10',
        iconColor: 'text-slate-600',
        glowColor: 'slate-500/20',
        accentColor: 'bg-slate-500',
      };
    }

    if (titleLower.includes('novo') || titleLower.includes('aberto')) {
      return {
        gradient: 'from-blue-500 via-blue-600 to-indigo-600',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-600',
        glowColor: 'blue-500/20',
        accentColor: 'bg-blue-500',
      };
    }

    if (
      titleLower.includes('pendente') ||
      titleLower.includes('aguardando') ||
      titleLower.includes('espera')
    ) {
      return {
        gradient: 'from-amber-500 via-orange-500 to-orange-600',
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-600',
        glowColor: 'amber-500/20',
        accentColor: 'bg-amber-500',
      };
    }

    if (
      titleLower.includes('resolvido') ||
      titleLower.includes('concluído') ||
      titleLower.includes('fechado')
    ) {
      return {
        gradient: 'from-emerald-500 via-green-600 to-teal-600',
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-600',
        glowColor: 'emerald-500/20',
        accentColor: 'bg-emerald-500',
      };
    }

    if (
      titleLower.includes('urgente') ||
      titleLower.includes('crítico') ||
      titleLower.includes('alta')
    ) {
      return {
        gradient: 'from-red-500 via-rose-600 to-pink-600',
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-600',
        glowColor: 'red-500/20',
        accentColor: 'bg-red-500',
      };
    }

    if (titleLower.includes('progresso') || titleLower.includes('andamento')) {
      return {
        gradient: 'from-purple-500 via-violet-600 to-indigo-600',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-600',
        glowColor: 'purple-500/20',
        accentColor: 'bg-purple-500',
      };
    }

    // Tema padrão
    return {
      gradient: 'from-gray-500 via-gray-600 to-gray-700',
      iconBg: 'bg-gray-500/10',
      iconColor: 'text-gray-600',
      glowColor: 'gray-500/20',
      accentColor: 'bg-gray-500',
    };
  }, [title]);

  return (
    <Card className="group relative overflow-hidden border-0 bg-white p-0 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-900">
      {/* Barra de acento no topo */}
      <div
        className={`absolute top-0 right-0 left-0 h-1 bg-linear-to-r ${theme.gradient}`}
      />

      {/* Glow effect no hover */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${theme.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-6">
        <CardTitle className="text-sm font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300">
          {title}
        </CardTitle>
        <div
          className={`${theme.iconBg} ${theme.iconColor} rounded-xl p-3 transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div
              className={`bg-linear-to-br text-5xl font-bold ${theme.gradient} bg-clip-text text-transparent`}
            >
              {value}
            </div>

            {trend && (
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={
                    trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                  }
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  vs. último período
                </span>
              </div>
            )}
          </div>

          {/* Indicador visual decorativo */}
          <div className="flex flex-col gap-1 opacity-20">
            <div className={`h-8 w-1 ${theme.accentColor} rounded-full`} />
            <div className={`h-5 w-1 ${theme.accentColor} rounded-full`} />
            <div className={`h-3 w-1 ${theme.accentColor} rounded-full`} />
          </div>
        </div>
      </CardContent>

      {/* Shimmer effect sutil */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="group-hover:animate-shimmer absolute inset-0 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </Card>
  );
}
