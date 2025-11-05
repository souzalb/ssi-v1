import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
// Os Enums são importados aqui (no Server Component)
import { Prisma, Role, Status, Priority } from '@prisma/client';
import Link from 'next/link';

// Nossos novos componentes
import { TicketFilters } from './ticket-filters';
import { PaginationControls } from './pagination-controls';

// Componentes (usando os seus caminhos)
import { Ticket, FolderKanban, Clock, CheckCircle } from 'lucide-react';
import db from '@/app/_lib/prisma';
import { Card, CardContent } from '@/app/_components/ui/card';
import {
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Table,
  TableHead,
} from '@/app/_components/ui/table';
import { Badge } from '@/app/_components/ui/badge';
import { StatCard } from '@/app/_components/stat-card'; // (Ajuste este caminho se necessário)
import { DataTable } from './data-table';
import { columns, TicketComRelacoes } from './columns';

// Props que a página recebe (agora inclui 'search')
interface TicketsPageProps {
  searchParams: Promise<{
    status?: Status;
    priority?: Priority;
    page?: string;
    search?: string; // <-- Novo
  }>;
}

const ITEMS_PER_PAGE = 20;

// 1. O Server Component (A Página)
export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  // 1.1. Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  const { id: userId, role, areaId } = session.user;

  // 1.2. Validar Parâmetros da URL (com 'await')
  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status;
  const priorityFilter = resolvedSearchParams.priority;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const searchFilter = resolvedSearchParams.search; // <-- Novo
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // 1.3. Construir a Cláusula 'where' (RBAC + Filtros)
  let where: Prisma.TicketWhereInput = {};

  // RBAC (igual ao dashboard)
  if (role === Role.COMMON) {
    where = { requesterId: userId };
  } else if (role === Role.TECHNICIAN) {
    where = { technicianId: userId };
  } else if (role === Role.MANAGER) {
    if (!areaId) {
      where = { id: 'impossivel' };
    } else {
      where = { areaId: areaId as string };
    }
  }

  // Filtros de Select
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (priorityFilter) {
    where.priority = priorityFilter;
  }

  // --- NOVO: Filtro de Pesquisa (OR) ---
  if (searchFilter) {
    where.OR = [
      { id: { equals: searchFilter } }, // Pesquisa exata por ID
      { title: { contains: searchFilter, mode: 'insensitive' } },
      { description: { contains: searchFilter, mode: 'insensitive' } },
      { equipment: { contains: searchFilter, mode: 'insensitive' } },
      { assetTag: { contains: searchFilter, mode: 'insensitive' } },
    ];
  }

  // 1.4. Executar todas as queries em paralelo
  const statsQuery = db.ticket.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: where, // Usa o 'where' completo (com RBAC, filtros e pesquisa)
  });

  const totalTicketsQuery = db.ticket.count({
    where: where,
  });

  const ticketsQuery = db.ticket.findMany({
    where,
    include: {
      requester: { select: { name: true } },
      area: { select: { name: true } },
      technician: { select: { name: true, photoUrl: true } },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: ITEMS_PER_PAGE,
    skip: skip,
  });

  const [stats, totalTickets, tickets] = await Promise.all([
    statsQuery,
    totalTicketsQuery,
    ticketsQuery,
  ]);

  // 1.5. Calcular Paginação e Stats
  const totalPages = Math.ceil(totalTickets / ITEMS_PER_PAGE);

  // (Mapeia os resultados do groupBy)
  const formattedStats = {
    [Status.OPEN]: 0,
    [Status.ASSIGNED]: 0,
    [Status.IN_PROGRESS]: 0,
    [Status.ON_HOLD]: 0,
    [Status.RESOLVED]: 0,
    [Status.CLOSED]: 0,
    [Status.CANCELLED]: 0,
  };
  for (const group of stats) {
    formattedStats[group.status] = group._count._all;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Gerenciador de Chamados</h1>

      {/* 2. Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Chamados (Filtro)"
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

      {/* 3. Filtros (Client Component) */}
      <TicketFilters
        statuses={Object.values(Status)}
        priorities={Object.values(Priority)}
      />

      {/* 4. Lista de Chamados */}
      <DataTable
        columns={columns}
        data={tickets as TicketComRelacoes[]} // (Força a tipagem)
      />

      {/* 5. Paginação (Client Component) */}
      <PaginationControls
        currentPage={page}
        totalPages={totalPages > 0 ? totalPages : 1} // Garante que totalPages seja pelo menos 1
        totalResults={totalTickets}
      />
    </div>
  );
}
