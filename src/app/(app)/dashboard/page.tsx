import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Priority, Prisma, Role, Status } from '@prisma/client';
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
import { Ticket, FolderKanban, Clock, CheckCircle } from 'lucide-react';
import { StatusChart } from './status-chart'; // (Importando o Gráfico)
import { StatCard } from '@/app/_components/stat-card';
import { PriorityChart } from './priority-chart';

// Tipo para os chamados
type TicketWithRequester = Prisma.TicketGetPayload<{
  include: { requester: { select: { name: true } } };
}>;

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

  // Query 1: A lista de chamados (agora apenas 5)
  const ticketsQuery = db.ticket.findMany({
    where,
    include: {
      requester: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5, // Apenas os 5 recentes
  });

  // Query 2: As estatísticas (para os Cards e Gráfico)
  const statsQuery = db.ticket.groupBy({
    by: ['status'],
    _count: {
      _all: true,
    },
    where: where, // Usa o MESMO 'where' do RBAC
  });

  const priorityStatsQuery = db.ticket.groupBy({
    by: ['priority'],
    _count: { _all: true },
    where: where, // Usa o mesmo 'where' do RBAC
  });

  const [tickets, stats, priorityStats] = await Promise.all([
    ticketsQuery,
    statsQuery,
    priorityStatsQuery, // Adiciona a nova query
  ]);

  // --- 4. Formatar os dados das Estatísticas ---
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
    // Encontra o item correspondente no array
    const item = formattedPriorityStats.find((p) => p.name === group.priority);
    if (item) {
      item.total = group._count._all;
    }
  }

  // --- 5. O JSX (COM NOVO LAYOUT) ---
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

      {/* Grid de Estatísticas (KPIs) */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Chamados"
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
          title="Chamados Resolvidos"
          value={formattedStats.RESOLVED}
          icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
        />
      </div>

      {/* --- 6. Grid de Gráficos e Chamados Recentes --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna da Esquerda (Gráfico) */}
        <div className="lg:col-span-2">
          {/* Passa os dados das estatísticas para o Client Component */}
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
    </div>
  );
}
