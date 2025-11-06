import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Prisma, Role, Status, Priority } from '@prisma/client';
import db from '@/app/_lib/prisma'; // (A usar o seu caminho)
import Link from 'next/link';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// --- 1. IMPORTAR FUNÇÕES DA DATE-FNS ---
import { subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Componentes ---
import { Button } from '@/app/_components/ui/button'; // (A usar o seu caminho)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/_components/ui/table';
import { Badge } from '@/app/_components/ui/badge';
import {
  Ticket,
  FolderKanban,
  Clock,
  CheckCircle,
  Star,
  Timer,
  CalendarCheck,
  MessageSquare,
} from 'lucide-react';
import { StatusChart } from './status-chart';
import { PriorityChart } from './priority-chart';
import { TrendChart } from './trend-chart'; // <-- Gráfico de Tendência
import { StatCard } from '@/app/_components/stat-card';
import { AreaChart } from './area-chart';

type TicketWithRequester = Prisma.TicketGetPayload<{
  include: { requester: { select: { name: true } } };
}>;

// --- Função Auxiliar 1 (calcula Tempo Médio E Taxa de SLA) ---
function calculatePerformanceMetrics(
  tickets: {
    createdAt: Date;
    resolvedAt: Date | null;
    slaDeadline: Date | null; // Inclui o SLA
  }[],
) {
  if (tickets.length === 0) {
    return { avgTime: 'N/A', slaRate: 'N/A', totalResolved: 0 };
  }

  let totalDurationMs = 0;
  let resolvedCount = 0;
  let resolvedOnTimeCount = 0; // Contador para SLA

  for (const ticket of tickets) {
    if (ticket.resolvedAt) {
      resolvedCount++;

      // 1. Cálculo do Tempo Médio
      const durationMs =
        ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      totalDurationMs += durationMs;

      // 2. Cálculo da Taxa de SLA
      if (ticket.slaDeadline && ticket.resolvedAt <= ticket.slaDeadline) {
        resolvedOnTimeCount++;
      }
    }
  }

  if (resolvedCount === 0) {
    return { avgTime: 'N/A', slaRate: 'N/A', totalResolved: 0 };
  }

  // Formata o Tempo Médio
  const avgMs = totalDurationMs / resolvedCount;
  const avgDays = avgMs / (1000 * 60 * 60 * 24);
  const avgTime = `${avgDays.toFixed(1)} dias`;

  // Formata a Taxa de SLA
  const rate = (resolvedOnTimeCount / resolvedCount) * 100;
  const slaRate = `${rate.toFixed(1)}%`;

  return { avgTime, slaRate, totalResolved: resolvedCount };
}

// --- Função Auxiliar 2 (para o Gráfico de Tendência) ---
function formatTrendData(
  tickets: { createdAt: Date; resolvedAt: Date | null }[],
) {
  const now = new Date();
  // Inicializa um mapa para os últimos 12 meses
  const dataMap = new Map<
    string,
    { month: string; Novos: number; Resolvidos: number }
  >();

  // Preenche o mapa com os 12 meses (ex: "Out/25", "Set/25", ...)
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthKey = format(date, 'MMM/yy', { locale: ptBR }); // "Nov/25"
    dataMap.set(monthKey, { month: monthKey, Novos: 0, Resolvidos: 0 });
  }

  // Processa os tickets da query
  for (const ticket of tickets) {
    // 1. Processa os "Novos" (por createdAt)
    const createdMonthKey = format(ticket.createdAt, 'MMM/yy', {
      locale: ptBR,
    });
    if (dataMap.has(createdMonthKey)) {
      dataMap.get(createdMonthKey)!.Novos++;
    }

    // 2. Processa os "Resolvidos" (por resolvedAt)
    if (ticket.resolvedAt) {
      const resolvedMonthKey = format(ticket.resolvedAt, 'MMM/yy', {
        locale: ptBR,
      });
      if (dataMap.has(resolvedMonthKey)) {
        dataMap.get(resolvedMonthKey)!.Resolvidos++;
      }
    }
  }

  // Retorna apenas os valores do mapa, na ordem correta
  return Array.from(dataMap.values());
}

export default async function DashboardPage() {
  // 1. Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  const { id, role, name, areaId } = session.user;

  // 2. Definir a Cláusula 'where' do RBAC (Role-Based Access Control)
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

  // --- 3. BUSCA DE DADOS OTIMIZADA (Promise.all) ---

  // Query 1: A lista de chamados (5 recentes)
  const ticketsQuery = db.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { requester: { select: { name: true } } },
  });

  // Query 2: As estatísticas por Status (para os gráficos)
  const statsQuery = db.ticket.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: where,
  });

  // Query 3: As estatísticas por Prioridade (para os gráficos)
  const priorityStatsQuery = db.ticket.groupBy({
    by: ['priority'],
    _count: { _all: true },
    where: where,
  });

  // Query 4: Média de Satisfação e Contagem
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

  // Query 5: Dados para Performance e Tendência (Últimos 12 meses)
  const oneYearAgo = subMonths(new Date(), 12);
  const performanceDataQuery = db.ticket.findMany({
    where: {
      ...where, // Aplica o RBAC
      OR: [
        // Pega chamados CRIADOS OU RESOLVIDOS no último ano
        { createdAt: { gte: oneYearAgo } },
        { resolvedAt: { gte: oneYearAgo } },
      ],
    },
    select: {
      createdAt: true,
      resolvedAt: true,
      slaDeadline: true,
    },
  });
  // --- 3.1.Query 6 (Condicional para Super Admin) ---
  let areaStatsQuery: Promise<any[]>;

  if (role === Role.SUPER_ADMIN) {
    // Se for Super Admin, busca a contagem de tickets por área
    areaStatsQuery = db.area.findMany({
      include: {
        _count: {
          select: { tickets: true }, // Conta os tickets em cada área
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  } else {
    // Se não for admin, apenas resolve uma promise vazia
    areaStatsQuery = Promise.resolve([]);
  }

  // --- 3.2. ATUALIZAR O PROMISE.ALL ---
  const [
    tickets,
    stats,
    priorityStats,
    avgRatingResult,
    performanceData,
    areaStats, // <-- 3.3. Adiciona o resultado
  ] = await Promise.all([
    ticketsQuery,
    statsQuery,
    priorityStatsQuery,
    avgRatingQuery,
    performanceDataQuery,
    areaStatsQuery, // <-- 3.4. Adiciona a query
  ]);

  // --- 4. Formatar os dados das Estatísticas ---

  // 4.1. Stats de Status (Operacionais)
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

  // 4.2. Stats de Prioridade (Gráfico)
  const formattedPriorityStats = Object.values(Priority).map((p) => ({
    name: p,
    total: 0,
  }));
  for (const group of priorityStats) {
    const item = formattedPriorityStats.find((p) => p.name === group.priority);
    if (item) item.total = group._count._all;
  }

  // 4.3. Métricas de Performance
  const resolvedTickets = performanceData.filter((t) => t.resolvedAt);
  const { avgTime, slaRate, totalResolved } =
    calculatePerformanceMetrics(resolvedTickets);

  const averageSatisfaction =
    avgRatingResult._avg.satisfactionRating?.toFixed(1) || 'N/A';
  const totalRatings = avgRatingResult._count._all;

  // 4.4. Dados de Tendência
  const trendData = formatTrendData(performanceData);

  // (Formata os dados que o Gráfico de Rosca espera)
  const formattedAreaStats = areaStats.map((area) => ({
    name: area.name,
    total: area._count.tickets,
  }));

  // --- 5. O JSX (Layout de 3 Secções) ---
  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Olá, {name}! Bem-vindo(a) de volta.
          </p>
        </div>
        <Button asChild>
          <Link href="/tickets/new">Abrir Novo Chamado</Link>
        </Button>
      </header>

      {/* --- SECÇÃO 1: MÉTRICAS OPERACIONAIS --- */}
      <h2 className="mb-4 text-2xl font-semibold">Visão Operacional</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Chamados (Fila)"
          value={totalTickets}
          icon={<Ticket className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Chamados Abertos"
          value={formattedStats.OPEN}
          icon={<FolderKanban className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Em Andamento"
          value={formattedStats.IN_PROGRESS + formattedStats.ASSIGNED}
          icon={<Clock className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Resolvidos (na fila)"
          value={formattedStats.RESOLVED}
          icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
        />
      </div>

      {/* --- SECÇÃO 2: GRÁFICOS E CHAMADOS RECENTES --- */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna da Esquerda (Gráficos) */}
        <div className="space-y-6 lg:col-span-2">
          <TrendChart data={trendData} />
          <StatusChart data={formattedStats} />
          <PriorityChart data={formattedPriorityStats} />
          {role === Role.SUPER_ADMIN && <AreaChart data={formattedAreaStats} />}
        </div>

        {/* Coluna da Direita (Chamados Recentes) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Chamados Recentes</CardTitle>
              <CardDescription>
                Os 5 chamados mais recentes na sua fila.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        Nenhum chamado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="hover:underline"
                        >
                          {ticket.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button asChild variant="link">
                  <Link href="/tickets">Ver todos os chamados &rarr;</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- SECÇÃO 3: MÉTRICAS DE PERFORMANCE --- */}
      <h2 className="mb-4 text-2xl font-semibold">Métricas de Performance</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tempo Médio de Resolução"
          value={avgTime}
          icon={<Timer className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Satisfação Média"
          value={
            averageSatisfaction === 'N/A' ? 'N/A' : `${averageSatisfaction}/5.0`
          }
          icon={<Star className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Taxa de Resolução (SLA)"
          value={slaRate}
          icon={<CalendarCheck className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Total de Avaliações"
          value={totalRatings}
          icon={<MessageSquare className="text-muted-foreground h-4 w-4" />}
        />
      </div>
    </div>
  );
}
