import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

import { Role } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- O Componente Cliente ---
import { CommentSection } from './comment-section'; // Ajuste o caminho
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';

import db from '@/app/_lib/prisma';
import { Badge } from '@/app/_components/ui/badge';
import { TicketActions } from './ticket-actions';

// 1. Função de busca e validação
async function getTicketData(ticketId: string) {
  // 1.1. Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return redirect('/login');
  }

  const { id: userId, role, areaId } = session.user;

  // 1.2. Buscar o chamado e seus relacionamentos
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      requester: { select: { name: true, email: true } },
      technician: { select: { name: true, email: true } },
      area: { select: { name: true } },
      comments: {
        include: {
          user: { select: { name: true, role: true, photoUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  // 1.3. Se o chamado não existir
  if (!ticket) {
    return redirect('/dashboard'); // (ou para uma página 404)
  }

  // 1.4. REGRA DE SEGURANÇA (RBAC)
  const isSuperAdmin = role === Role.SUPER_ADMIN;
  const isRequester = ticket.requesterId === userId;
  const isTechnician = ticket.technicianId === userId;
  const isManager = role === Role.MANAGER && ticket.areaId === areaId;

  const canView = isSuperAdmin || isRequester || isTechnician || isManager;

  if (!canView) {
    return redirect('/dashboard'); // Redireciona se não tiver permissão
  }

  // 1.5. Retorna os dados se a permissão for válida
  return { ticket, session };
}

// 2. O Server Component (A Página)
export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  const data = await getTicketData(resolvedParams.id);

  // Se getTicketData redirecionou, o React "suspende" a renderização
  // e o TS reclama que 'data' pode não ser o esperado.
  // Mas como a função *é* a de redirecionamento, podemos assumir que 'ticket' existe.
  // (Uma verificação extra por segurança)
  if (!data || !data.ticket) {
    return null; // O redirect() já foi acionado
  }

  const { ticket, session } = data;

  return (
    <div className="space-y-6 p-8">
      {/* --- Cabeçalho --- */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ticket.title}</h1>
          <p className="text-muted-foreground">
            Aberto por {ticket.requester.name} em{' '}
            {format(new Date(ticket.createdAt), "dd 'de' LLLL 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>
        <TicketActions ticket={ticket} currentUser={session.user} />
      </header>

      {/* --- Grid de Detalhes --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* --- Coluna Principal (Descrição e Comentários) --- */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* 3. Renderiza o Client Component */}
          <CommentSection
            ticketId={ticket.id}
            initialComments={ticket.comments}
            currentUserRole={session.user.role}
          />
        </div>

        {/* --- Coluna Lateral (Informações) --- */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Status" value={<Badge>{ticket.status}</Badge>} />
              <InfoRow
                label="Prioridade"
                value={<Badge variant="destructive">{ticket.priority}</Badge>}
              />
              <InfoRow label="Área" value={ticket.area.name} />
              <InfoRow label="Solicitante" value={ticket.requester.name} />
              <InfoRow
                label="Técnico"
                value={ticket.technician?.name || 'Não atribuído'}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Localização" value={ticket.location} />
              <InfoRow label="Equipamento" value={ticket.equipment} />
              <InfoRow label="Modelo" value={ticket.model} />
              <InfoRow label="Patrimônio (N/P)" value={ticket.assetTag} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para a coluna lateral
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}
