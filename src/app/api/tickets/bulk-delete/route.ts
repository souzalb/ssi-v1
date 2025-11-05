import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// 1. Schema de Validação (Zod)
// Espera um objeto com um array de CUIDs
const bulkDeleteSchema = z.object({
  ticketIds: z.array(z.string().cuid('ID de ticket inválido')).min(1),
});

// 2. Handler POST
export async function POST(req: Request) {
  // 2.1. Segurança: Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2.2. Autorização (RBAC): Quem pode fazer isto?
  // Apenas Gestores e Super Admins
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
    const validation = bulkDeleteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    const { ticketIds } = validation.data;

    // --- 2.4. CONSTRUÇÃO DA QUERY SEGURA ---
    const where: Prisma.TicketWhereInput = {
      // Condição 1: Os IDs devem estar na lista enviada
      id: {
        in: ticketIds,
      },
    };

    // Condição 2: Aplicar o RBAC
    if (role === Role.MANAGER) {
      // Se for Gestor, SÓ PODE apagar chamados da sua própria área
      if (!areaId) {
        return NextResponse.json(
          { error: 'Gestor não associado a uma área' },
          { status: 403 },
        );
      }
      where.areaId = areaId;
    }
    // Se for SUPER_ADMIN, o 'where' não precisa de mais nada,
    // ele pode apagar qualquer chamado (desde que esteja na 'ticketIds')

    // 2.5. Executar a exclusão em lote
    const result = await db.ticket.deleteMany({
      where: where,
    });

    // 'result.count' será o número de chamados *realmente* apagados
    // (Se um Gestor tentar apagar um ID de outra área, ele será ignorado)
    return NextResponse.json({
      message: `${result.count} chamado(s) excluído(s) com sucesso.`,
      count: result.count,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_TICKETS_BULK_DELETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
