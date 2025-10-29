import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
// Use o caminho correto para seus helpers
import { getSession } from '@/app/_lib/auth';
import db from '@/app/_lib/prisma';

/**
 * @api {get} /api/tickets
 * @description (App Router) Rota para listar chamados com base na permissão.
 *
 * @returns {Promise<NextResponse>}
 */
export async function GET() {
  try {
    // 1. Obter a sessão do usuário (simulada)
    const session = await getSession();

    // 2. Trava de segurança
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { user } = session;

    // 3. Montar a consulta de permissão
    const whereClause: Prisma.TicketWhereInput = {};

    switch (user.role) {
      case 'COMMON':
        whereClause.requesterId = user.id;
        break;
      case 'TECHNICIAN':
        whereClause.technicianId = user.id;
        break;
      case 'MANAGER':
        if (!user.areaId) {
          return NextResponse.json(
            { error: 'Gestor não está associado a nenhuma área' },
            { status: 403 },
          );
        }
        whereClause.areaId = user.areaId;
        break;
      case 'SUPER_ADMIN':
        // Vê tudo
        break;
      default:
        return NextResponse.json(
          { error: 'Permissão inválida' },
          { status: 403 },
        );
    }

    // 4. Executar a consulta no banco de dados
    const tickets = await db.ticket.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        requester: {
          select: { name: true, photoUrl: true },
        },
        technician: {
          select: { name: true, photoUrl: true },
        },
        area: {
          select: { name: true },
        },
      },
    });

    // 5. Retornar os dados
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erro interno desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: errorMessage },
      { status: 500 },
    );
  }
}

// NOTA: Não adicione 'export default' neste arquivo.
// Apenas exportações nomeadas (GET, POST, etc.)
