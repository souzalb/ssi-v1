import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Prisma, Role, Status, Priority } from '@prisma/client';
import db from '@/app/_lib/prisma';
import Link from 'next/link';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/app/_components/ui/button';
import {
  Ticket,
  FolderKanban,
  Clock,
  CheckCircle,
  Star,
  Timer,
  CalendarCheck,
  MessageSquare,
  RefreshCcw,
  TicketPlusIcon,
  PauseIcon,
} from 'lucide-react';
import { StatusChart } from './status-chart';
import { PriorityChart } from './priority-chart';
import { TrendChart } from './trend-chart';
import { StatCard } from '@/app/_components/stat-card';
import { AreaChart } from './area-chart';
import { RecentTicketsCard } from './recents-tickets-card';

type TicketWithRequester = Prisma.TicketGetPayload<{
  include: { requester: { select: { name: true } } };
}>;

// --- Função Auxiliar 1 (calcula Tempo Médio E Taxa de SLA) ---
function calculatePerformanceMetrics(
  tickets: {
    createdAt: Date;
    resolvedAt: Date | null;
    slaDeadline: Date | null;
  }[],
) {
  if (tickets.length === 0) {
    return { avgTime: 'N/A', slaRate: 'N/A', totalResolved: 0 };
  }

  let totalDurationMs = 0;
  let resolvedCount = 0;
  let resolvedOnTimeCount = 0;

  for (const ticket of tickets) {
    if (ticket.resolvedAt) {
      resolvedCount++;

      const durationMs =
        ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      totalDurationMs += durationMs;

      if (ticket.slaDeadline && ticket.resolvedAt <= ticket.slaDeadline) {
        resolvedOnTimeCount++;
      }
    }
  }

  if (resolvedCount === 0) {
    return { avgTime: 'N/A', slaRate: 'N/A', totalResolved: 0 };
  }

  const avgMs = totalDurationMs / resolvedCount;
  const avgDays = avgMs / (1000 * 60 * 60 * 24);
  const avgTime = `${avgDays.toFixed(1)} dias`;

  const rate = (resolvedOnTimeCount / resolvedCount) * 100;
  const slaRate = `${rate.toFixed(1)}%`;

  return { avgTime, slaRate, totalResolved: resolvedCount };
}

// --- Função Auxiliar 2 (para o Gráfico de Tendência) ---
function formatTrendData(
  tickets: { createdAt: Date; resolvedAt: Date | null }[],
) {
  const now = new Date();
  const dataMap = new Map<
    string,
    { month: string; Novos: number; Resolvidos: number }
  >();

  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthKey = format(date, 'MMM/yy', { locale: ptBR });
    dataMap.set(monthKey, { month: monthKey, Novos: 0, Resolvidos: 0 });
  }

  for (const ticket of tickets) {
    const createdMonthKey = format(ticket.createdAt, 'MMM/yy', {
      locale: ptBR,
    });
    if (dataMap.has(createdMonthKey)) {
      dataMap.get(createdMonthKey)!.Novos++;
    }

    if (ticket.resolvedAt) {
      const resolvedMonthKey = format(ticket.resolvedAt, 'MMM/yy', {
        locale: ptBR,
      });
      if (dataMap.has(resolvedMonthKey)) {
        dataMap.get(resolvedMonthKey)!.Resolvidos++;
      }
    }
  }

  return Array.from(dataMap.values());
}

// --- Função Auxiliar 3 (para calcular Trends) ---
function calculateTrend(
  currentPeriodData: any[],
  previousPeriodData: any[],
  filterFn: (item: any) => boolean,
): { value: number; isPositive: boolean } | undefined {
  const currentCount = currentPeriodData.filter(filterFn).length;
  const previousCount = previousPeriodData.filter(filterFn).length;

  if (previousCount === 0) return undefined;

  const percentChange = ((currentCount - previousCount) / previousCount) * 100;

  return {
    value: Math.abs(Math.round(percentChange)),
    isPositive: percentChange >= 0,
  };
}

export default async function DashboardPage() {
  const formattedDate = format(new Date(), 'dd/MM/yyyy, HH:mm', {
    locale: ptBR,
  });

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  const { id, role, name, areaId } = session.user;

  let where: Prisma.TicketWhereInput = {};

  if (role === Role.COMMON) {
    where = { requesterId: id };
  } else if (role === Role.TECHNICIAN) {
    where = { technicianId: id };
  } else if (role === Role.MANAGER) {
    if (!areaId) {
      where = { id: 'impossivel' };
    } else {
      where = { areaId: areaId as string };
    }
  }

  // --- QUERIES ---
  const ticketsQuery = db.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { requester: { select: { name: true } }, area: true },
  });

  const statsQuery = db.ticket.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: where,
  });

  const priorityStatsQuery = db.ticket.groupBy({
    by: ['priority'],
    _count: { _all: true },
    where: where,
  });

  const avgRatingQuery = db.ticket.aggregate({
    _avg: {
      satisfactionRating: true,
    },
    _count: {
      _all: true,
    },
    where: {
      ...where,
      satisfactionRating: { not: null },
    },
  });

  const oneYearAgo = subMonths(new Date(), 12);
  const performanceDataQuery = db.ticket.findMany({
    where: {
      ...where,
      OR: [
        { createdAt: { gte: oneYearAgo } },
        { resolvedAt: { gte: oneYearAgo } },
      ],
    },
    select: {
      createdAt: true,
      resolvedAt: true,
      slaDeadline: true,
      status: true,
    },
  });

  // Queries para calcular trends
  const twoMonthsAgo = subMonths(new Date(), 2);
  const oneMonthAgo = subMonths(new Date(), 1);

  const currentPeriodDataQuery = db.ticket.findMany({
    where: {
      ...where,
      createdAt: { gte: oneMonthAgo },
    },
    select: { status: true, createdAt: true, resolvedAt: true },
  });

  const previousPeriodDataQuery = db.ticket.findMany({
    where: {
      ...where,
      createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo },
    },
    select: { status: true, createdAt: true, resolvedAt: true },
  });

  let areaStatsQuery: Promise<any[]>;

  if (role === Role.SUPER_ADMIN) {
    areaStatsQuery = db.area.findMany({
      include: {
        _count: {
          select: { tickets: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  } else {
    areaStatsQuery = Promise.resolve([]);
  }

  const [
    tickets,
    stats,
    priorityStats,
    avgRatingResult,
    performanceData,
    areaStats,
    currentPeriodData,
    previousPeriodData,
  ] = await Promise.all([
    ticketsQuery,
    statsQuery,
    priorityStatsQuery,
    avgRatingQuery,
    performanceDataQuery,
    areaStatsQuery,
    currentPeriodDataQuery,
    previousPeriodDataQuery,
  ]);

  // --- FORMATAÇÃO DOS DADOS ---
  const formattedStats = {
    [Status.OPEN]: 0,
    [Status.ASSIGNED]: 0,
    [Status.IN_PROGRESS]: 0,
    [Status.ON_HOLD]: 0,
    [Status.RESOLVED]: 0,
    [Status.CLOSED]: 0,
    [Status.CANCELLED]: 0,
  };
  let totalTickets = 0;
  for (const group of stats) {
    formattedStats[group.status] = group._count._all;
    totalTickets += group._count._all;
  }

  const formattedPriorityStats = Object.values(Priority).map((p) => ({
    name: p,
    total: 0,
  }));
  for (const group of priorityStats) {
    const item = formattedPriorityStats.find((p) => p.name === group.priority);
    if (item) item.total = group._count._all;
  }

  const resolvedTickets = performanceData.filter((t) => t.resolvedAt);
  const { avgTime, slaRate, totalResolved } =
    calculatePerformanceMetrics(resolvedTickets);

  const averageSatisfaction =
    avgRatingResult._avg.satisfactionRating?.toFixed(1) || 'N/A';
  const totalRatings = avgRatingResult._count._all;

  const trendData = formatTrendData(performanceData);

  const formattedAreaStats = areaStats.map((area) => ({
    name: area.name,
    total: area._count.tickets,
  }));

  // Calcular Trends dos Cards
  const totalTrend = calculateTrend(
    currentPeriodData,
    previousPeriodData,
    () => true,
  );

  const newTicketsTrend = calculateTrend(
    currentPeriodData,
    previousPeriodData,
    (t) => t.status === Status.OPEN,
  );

  const inProgressTrend = calculateTrend(
    currentPeriodData,
    previousPeriodData,
    (t) => t.status === Status.IN_PROGRESS || t.status === Status.ASSIGNED,
  );

  const resolvedTrend = calculateTrend(
    currentPeriodData,
    previousPeriodData,
    (t) => t.status === Status.RESOLVED,
  );

  const onHoldTrend = calculateTrend(
    currentPeriodData,
    previousPeriodData,
    (t) => t.status === Status.ON_HOLD,
  );

  return (
    <div className="p-8 pt-6">
      {/* <AutoRefresher interval={300000} /> */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Olá, {name}! Bem-vindo(a) de volta.
          </p>
        </div>
        <div className="text-muted-foreground flex flex-col items-end space-y-2 text-sm">
          <Button asChild>
            <Link href="/tickets/new">
              <TicketPlusIcon className="h-4 w-4" />
              Abrir Novo Chamado
            </Link>
          </Button>
          <div className="flex items-center">
            <RefreshCcw className="animation-duration-[5s] mr-1.5 h-4 w-4 animate-spin" />
            <span>Última atualização: {formattedDate}</span>
          </div>
        </div>
      </header>

      {/* --- SECÇÃO 1: MÉTRICAS OPERACIONAIS --- */}
      <h2 className="mb-4 text-xl font-semibold">Visão Operacional</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total de Chamados"
          value={totalTickets}
          icon={<Ticket className="h-5 w-5" />}
          trend={totalTrend}
        />
        <StatCard
          title="Novos Chamados"
          value={formattedStats.OPEN}
          icon={<FolderKanban className="h-5 w-5" />}
          trend={newTicketsTrend}
        />
        <StatCard
          title="Em Andamento"
          value={formattedStats.IN_PROGRESS + formattedStats.ASSIGNED}
          icon={<Clock className="h-5 w-5" />}
          trend={inProgressTrend}
        />
        <StatCard
          title="Em Espera"
          value={formattedStats.ON_HOLD}
          icon={<PauseIcon className="h-5 w-5" />}
          trend={onHoldTrend}
        />
        <StatCard
          title="Resolvidos"
          value={formattedStats.RESOLVED}
          icon={<CheckCircle className="h-5 w-5" />}
          trend={resolvedTrend}
        />
      </div>

      {/* --- SECÇÃO 2: GRÁFICOS E CHAMADOS RECENTES --- */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TrendChart data={trendData} />
          <StatusChart data={formattedStats} />
          <PriorityChart data={formattedPriorityStats} />
          {role === Role.SUPER_ADMIN && <AreaChart data={formattedAreaStats} />}
        </div>

        <div className="lg:col-span-1">
          <RecentTicketsCard
            tickets={tickets.map((ticket) => ({
              id: ticket.id,
              title: ticket.title,
              status: ticket.status,
              createdAt: ticket.createdAt,
              priority: ticket.priority,
              requesterName: ticket.requester.name,
              department: ticket.area.name,
            }))}
          />
        </div>
      </div>

      {/* --- SECÇÃO 3: MÉTRICAS DE PERFORMANCE --- */}
      <h2 className="mb-4 text-2xl font-semibold">Métricas de Performance</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tempo Médio de Resolução"
          value={avgTime}
          icon={<Timer className="h-5 w-5" />}
        />
        <StatCard
          title="Satisfação Média"
          value={
            averageSatisfaction === 'N/A' ? 'N/A' : `${averageSatisfaction}/5.0`
          }
          icon={<Star className="h-5 w-5" />}
        />
        <StatCard
          title="Taxa de Resolução (SLA)"
          value={slaRate}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Total de Avaliações"
          value={totalRatings}
          icon={<MessageSquare className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
