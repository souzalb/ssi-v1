import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, Role, Status } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// 1. Schema de Validação (sem alteração)
const bulkUpdateSchema = z
  .object({
    ticketIds: z
      .array(z.string().cuid('ID de ticket inválido'))
      .min(1, 'Pelo menos um ID de ticket é necessário'),
    status: z.nativeEnum(Status).optional(),
    technicianId: z.string().cuid().nullable().optional(), // 'null' para desatribuir
  })
  .refine(
    (data) => data.status !== undefined || data.technicianId !== undefined,
    {
      message:
        'Pelo menos uma ação (status ou technicianId) deve ser fornecida',
    },
  );

// 2. Handler POST
export async function POST(req: Request) {
  // 2.1. Segurança: Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2.2. Autorização (RBAC): Apenas Gestores e Super Admins
  const { role, areaId } = session.user;
  if (role === Role.COMMON || role === Role.TECHNICIAN) {
    return NextResponse.json(
      { error: 'Acesso negado para esta ação' },
      { status: 403 }, // Forbidden
    );
  }

  try {
    // 2.3. Validar o corpo (body)
    const body = await req.json();
    const validation = bulkUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    const { ticketIds, status, technicianId } = validation.data;

    if (status === Status.CLOSED) {
      return NextResponse.json(
        { error: 'Apenas o solicitante pode fechar chamados.' },
        { status: 403 },
      );
    }

    // --- 2.4. CONSTRUÇÃO DA QUERY SEGURA (RBAC) ---
    // Este 'where' será usado para filtrar os IDs que o utilizador
    // tem permissão para alterar.
    const where: Prisma.TicketWhereInput = {
      id: {
        in: ticketIds,
      },
    };
    if (role === Role.MANAGER) {
      if (!areaId) {
        return NextResponse.json(
          { error: 'Gestor não associado a uma área' },
          { status: 403 },
        );
      }
      where.areaId = areaId;
    }

    // --- 2.5. DIVISÃO DA LÓGICA DE ATUALIZAÇÃO ---

    // Caso 1: Ação envolve Técnico (Requer Transação)
    if (technicianId !== undefined) {
      // Prepara os dados para o 'update' (singular)
      const dataForUpdate: Prisma.TicketUpdateInput = {};
      if (technicianId === null) {
        dataForUpdate.technician = { disconnect: true };
      } else {
        dataForUpdate.technician = { connect: { id: technicianId } };
        if (status === undefined) dataForUpdate.status = Status.ASSIGNED;
      }

      // Se o status também foi enviado, adiciona-o
      if (status !== undefined) {
        dataForUpdate.status = status;
        if (status === Status.RESOLVED) {
          // (Limitação: Não conseguimos verificar o 'resolvedAt' antigo
          // de forma eficiente numa transação em lote)
          dataForUpdate.resolvedAt = new Date();
        }
      }

      // Primeiro, encontramos os IDs que este utilizador pode, de facto, atualizar
      const ticketsToUpdate = await db.ticket.findMany({
        where: where, // Aplica o RBAC
        select: { id: true },
      });
      const idsToUpdate = ticketsToUpdate.map((t) => t.id);

      if (idsToUpdate.length === 0) {
        return NextResponse.json({
          message: 'Nenhum chamado válido encontrado para atualizar.',
          count: 0,
        });
      }

      // Cria um array de promessas de 'update' (singular)
      const updateQueries = idsToUpdate.map((id) =>
        db.ticket.update({
          where: { id: id },
          data: dataForUpdate,
        }),
      );

      // Executa todas as atualizações dentro de uma transação
      const result = await db.$transaction(updateQueries);

      return NextResponse.json({
        message: `${result.length} chamado(s) atualizado(s) com sucesso.`,
        count: result.length,
      });
    }
    // Caso 2: Ação SÓ mexe com o Status (Podemos usar updateMany)
    else if (status !== undefined) {
      const dataToUpdate: Prisma.TicketUpdateManyMutationInput = {
        status: status,
      };

      if (status === Status.RESOLVED) {
        // ATENÇÃO: Esta ação vai SOBRESCREVER o 'resolvedAt'
        // de chamados que talvez já estivessem resolvidos.
        // É uma limitação do 'updateMany'.
        dataToUpdate.resolvedAt = new Date();
      }

      const result = await db.ticket.updateMany({
        where: where, // 'where' (com RBAC)
        data: dataToUpdate,
      });

      return NextResponse.json({
        message: `${result.count} chamado(s) atualizado(s) com sucesso.`,
        count: result.count,
      });
    }

    // (O Zod .refine() deve impedir que cheguemos aqui)
    return NextResponse.json(
      { error: 'Nenhuma ação fornecida' },
      { status: 400 },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_TICKETS_BULK_UPDATE_ERROR]', error);
    // Erro P2025: Um 'technicianId' para o 'connect' não foi encontrado
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'O técnico selecionado para atribuição não existe.' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
