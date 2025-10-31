import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Prisma, Role, Status } from '@prisma/client';

import { Ticket, FolderKanban, Clock, CheckCircle } from 'lucide-react'; // (Rode: npm install lucide-react)
import db from '../../_lib/prisma';
import { Button } from '../../_components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../_components/ui/card';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '../../_components/ui/table';
import { Badge } from '../../_components/ui/badge';

// Tipo para os chamados (incluindo o solicitante)
type TicketWithRequester = Prisma.TicketGetPayload<{
  include: { requester: { select: { name: true } } };
}>;

// 2. O Componente de Página (Async Server Component)
export default async function DashboardPage() {
  // 3. Buscar a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  const { id, role, name, areaId } = session.user;

  // 4. Definir a Cláusula 'where' do RBAC (Role-Based Access Control)
  let where: Prisma.TicketWhereInput = {};

  if (role === Role.COMMON) {
    // Usuário comum vê apenas os chamados que abriu
    where = { requesterId: id };
  } else if (role === Role.TECHNICIAN) {
    // Técnico vê chamados atribuídos a ele
    where = { technicianId: id };
  } else if (role === Role.MANAGER) {
    // Gerente vê todos os chamados da sua área
    if (!areaId) {
      where = { id: 'impossivel' }; // Retorna array vazio se gerente não tiver área
    } else {
      where = { areaId: areaId as string };
    }
  }
  // (Super Admin não tem 'where', vê tudo)

  // --- 5. BUSCA DE DADOS OTIMIZADA (Promise.all) ---
  // Vamos buscar a lista de chamados E as estatísticas em paralelo

  // Query 1: A lista de chamados
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
    take: 50,
  });

  // Query 2: As estatísticas (usando groupBy)
  const statsQuery = db.ticket.groupBy({
    by: ['status'],
    _count: {
      _all: true,
    },
    where: where, // Usa o MESMO 'where' do RBAC
  });

  // Executa ambas as queries ao mesmo tempo
  const [tickets, stats] = await Promise.all([ticketsQuery, statsQuery]);

  // --- 6. Formatar os dados das Estatísticas ---
  // Inicializa o objeto com todos os status
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

  // --- 7. O JSX ---
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

      {/* --- 8. Grid de Estatísticas --- */}
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

      {/* --- 9. Tabela de Chamados --- */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Chamados</CardTitle>
          <CardDescription>
            {role === Role.COMMON
              ? 'Chamados abertos por você.'
              : 'Chamados na sua fila de gerenciamento.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
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
                    {/* TODO: Criar um componente Badge de Status com cores */}
                    <Badge variant="outline">{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {/* TODO: Criar um componente Badge de Prioridade com cores */}
                    <Badge variant="destructive">{ticket.priority}</Badge>
                  </TableCell>
                  <TableCell>{ticket.requester.name}</TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// --- 10. Componente Auxiliar para os Cards ---
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
