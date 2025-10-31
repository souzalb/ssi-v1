import { NextResponse } from 'next/server';

import { z } from 'zod';
import { Prisma, Role, Status } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// 1. Schema de Validação (Zod)
// Define os campos que PODEM ser atualizados
const ticketUpdateSchema = z.object({
  status: z.nativeEnum(Status).optional(),
  technicianId: z.string().cuid().nullable().optional(), // 'null' para desatribuir
});

// 2. Handler PATCH
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 2.1. Segurança: Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2.2. Obter ID do Chamado (com 'await' da correção anterior)
  const params = await context.params;
  const ticketId = params.id;

  // 2.3. Obter dados do chamado ATUAL (para checar permissões)
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return NextResponse.json(
      { error: 'Chamado não encontrado' },
      { status: 404 },
    );
  }

  // 2.4. Autorização (RBAC)
  const { role, areaId, id: userId } = session.user;

  const isSuperAdmin = role === Role.SUPER_ADMIN;
  const isManager = role === Role.MANAGER && ticket.areaId === areaId;
  const isAssignedTech =
    role === Role.TECHNICIAN && ticket.technicianId === userId;

  // Somente estes usuários podem atualizar
  const canUpdate = isSuperAdmin || isManager || isAssignedTech;
  if (!canUpdate) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    // 2.5. Validar o corpo (body)
    const body = await req.json();
    const validation = ticketUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    const { status, technicianId } = validation.data;

    // 2.6. Autorização Específica da Ação
    // Um Técnico não pode atribuir/desatribuir (apenas Mudar Status)
    if (technicianId !== undefined && role === Role.TECHNICIAN) {
      return NextResponse.json(
        { error: 'Técnicos não podem atribuir chamados' },
        { status: 403 },
      );
    }

    // 2.7. Preparar os dados para atualização
    const dataToUpdate: Prisma.TicketUpdateInput = {};

    if (status) {
      dataToUpdate.status = status;
    }

    // 'technicianId' foi enviado? (pode ser string ou null)
    if (technicianId !== undefined) {
      if (technicianId === null) {
        // --- CORREÇÃO AQUI ---
        // Se 'null', desatribui o técnico
        dataToUpdate.technician = {
          disconnect: true,
        };
      } else {
        // --- CORREÇÃO AQUI ---
        // Se for um ID 'string', conecta o novo técnico
        dataToUpdate.technician = {
          connect: {
            id: technicianId,
          },
        };

        // Lógica de Negócio: Se atribuir um técnico e o chamado estiver
        // 'OPEN', automaticamente muda para 'ASSIGNED'.
        if (
          ticket.status === Status.OPEN &&
          !status // (Só se o status não foi mudado manualmente na mesma requisição)
        ) {
          dataToUpdate.status = Status.ASSIGNED;
        }
      }
    }

    // 2.8. Atualizar o chamado no banco
    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: dataToUpdate,
      // Retorna o chamado atualizado com os dados necessários para a UI
      include: {
        requester: { select: { name: true } },
        technician: { select: { name: true } },
        area: { select: { name: true } },
      },
    });

    return NextResponse.json(updatedTicket);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_TICKETS_PATCH_ERROR]', error);
    // Erro comum: technicianId enviado não existe
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'O técnico selecionado não existe' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
