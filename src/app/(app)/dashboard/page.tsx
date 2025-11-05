import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Prisma, Role, Status, Priority } from '@prisma/client';
import db from '@/app/_lib/prisma'; // (Usando o seu caminho de importação)
import Link from 'next/link';

// --- Componentes ---
import { Button } from '@/app/_components/ui/button'; // (Usando o seu caminho)
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
  BarChart,
  MessageSquare,
} from 'lucide-react';
import { StatusChart } from './status-chart'; // (Importando o Gráfico de Status)
import { PriorityChart } from './priority-chart'; // (Importando o Gráfico de Prioridade)
import { StatCard } from '@/app/_components/stat-card';

type TicketWithRequester = Prisma.TicketGetPayload<{
  include: { requester: { select: { name: true } } };
}>;

// --- Função Auxiliar (cálculo de tempo) ---
function calculateAverageResolutionTime(
  tickets: { createdAt: Date; resolvedAt: Date | null }[],
): string {
  if (tickets.length === 0) {
    return 'N/A';
  }

  let totalDurationMs = 0;
  let resolvedCount = 0;

  for (const ticket of tickets) {
    if (ticket.resolvedAt) {
      const durationMs =
        ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      totalDurationMs += durationMs;
      resolvedCount++;
    }
  }

  if (resolvedCount === 0) {
    return 'N/A';
  }

  const avgMs = totalDurationMs / resolvedCount;
  const avgDays = avgMs / (1000 * 60 * 60 * 24); // Converte ms para dias

  return `${avgDays.toFixed(1)} dias`;
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
      where = { id: 'impossivel' }; // Retorna array vazio se gerente não tiver área
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
    where: where, // Usa o mesmo 'where' do RBAC
  });

  // Query 4: Média de Satisfação e Contagem
  const avgRatingQuery = db.ticket.aggregate({
    _avg: {
      satisfactionRating: true,
    },
    _count: {
      satisfactionRating: true,
    },
    where: {
      ...where, // Aplica o RBAC
      satisfactionRating: { not: null }, // Apenas os que têm avaliação
    },
  });

  // Query 5: Dados para Tempo Médio de Resolução
  const resolutionTimesQuery = db.ticket.findMany({
    where: {
      ...where, // Aplica o RBAC
      resolvedAt: { not: null }, // Apenas os resolvidos
    },
    select: {
      createdAt: true,
      resolvedAt: true,
    },
  });

  // Executa todas as 5 queries ao mesmo tempo
  const [tickets, stats, priorityStats, avgRatingResult, resolutionTimeData] =
    await Promise.all([
      ticketsQuery,
      statsQuery,
      priorityStatsQuery,
      avgRatingQuery,
      resolutionTimesQuery,
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
  const totalResolved = formattedStats.RESOLVED + formattedStats.CLOSED;

  // 4.2. Stats de Prioridade (Gráfico)
  const formattedPriorityStats = Object.values(Priority).map((p) => ({
    name: p,
    total: 0,
  }));

  for (const group of priorityStats) {
    const item = formattedPriorityStats.find((p) => p.name === group.priority);
    if (item) {
      item.total = group._count._all;
    }
  }

  // 4.3. Métricas de Performance
  const averageSatisfaction =
    avgRatingResult._avg.satisfactionRating?.toFixed(1) || 'N/A';
  const totalRatings = avgRatingResult._count.satisfactionRating;
  const averageResolutionTime =
    calculateAverageResolutionTime(resolutionTimeData);

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
          <StatusChart data={formattedStats} />
          <PriorityChart data={formattedPriorityStats} />
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
          value={averageResolutionTime}
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
          title="Total de Avaliações"
          value={totalRatings}
          icon={<MessageSquare className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Total Resolvidos (Hist.)"
          value={totalResolved}
          icon={<BarChart className="text-muted-foreground h-4 w-4" />}
        />
      </div>
    </div>
  );
}
