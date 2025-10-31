// app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste o caminho
import { redirect } from 'next/navigation';
import { Prisma, Role } from '@prisma/client';
import Link from 'next/link';
import db from '../_lib/prisma';
import { Button } from '../_components/ui/button';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../_components/ui/card';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '../_components/ui/table';
import { Badge } from '../_components/ui/badge';

// 1. O Componente de Página (Async Server Component)
export default async function DashboardPage() {
  // 2. Buscar a sessão no servidor
  const session = await getServerSession(authOptions);

  // O middleware já deve ter protegido, mas é uma boa prática
  if (!session || !session.user) {
    redirect('/login');
  }

  const { id, role, name, areaId } = session.user;

  // 3. Definir a Cláusula 'where' do Prisma com base na Role (RBAC)
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
      // Caso de borda: Gerente sem área
      where = { id: 'impossivel' }; // Retorna array vazio
    }
    where = { areaId: areaId as string };
  } else if (role === Role.SUPER_ADMIN) {
    // Super Admin vê tudo (sem 'where' clause)
  }

  // 4. Buscar os dados
  const tickets = await db.ticket.findMany({
    where,
    include: {
      requester: {
        select: { name: true }, // Inclui o nome do solicitante
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Limita para não sobrecarregar
  });

  // 5. O JSX
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

      {/* TODO: Adicionar Cards de Estatísticas aqui (ex: Chamados Abertos, etc.) */}

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
          {/* 6. A Tabela de Chamados */}
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
