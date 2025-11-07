import { NextResponse } from 'next/server';
import { Prisma, Role, Status } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// Esta API retorna a contagem de chamados que "precisam de atenção"
// com base na role do utilizador
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id: userId, role, areaId } = session.user;

  // 1. Construir a cláusula 'where' com base no RBAC
  let where: Prisma.TicketWhereInput = {};

  if (role === Role.COMMON) {
    // Utilizador comum: Vê os seus chamados em andamento ou abertos
    where = {
      requesterId: userId,
      status: {
        in: [Status.OPEN, Status.ASSIGNED, Status.IN_PROGRESS, Status.ON_HOLD],
      },
    };
  } else if (role === Role.TECHNICIAN) {
    // Técnico: Vê os chamados atribuídos a ele (e não fechados)
    where = {
      technicianId: userId,
      status: { in: [Status.ASSIGNED, Status.IN_PROGRESS, Status.ON_HOLD] },
    };
  } else if (role === Role.MANAGER) {
    // Gestor: Vê os chamados ABERTOS (não atribuídos) da sua área
    where = {
      areaId: areaId as string,
      status: Status.OPEN,
    };
  } else if (role === Role.SUPER_ADMIN) {
    // Super Admin: Vê TODOS os chamados ABERTOS
    where = {
      status: Status.OPEN,
    };
  } else {
    // Se não tiver role, não vê nada
    return NextResponse.json({ count: 0 });
  }

  try {
    // 2. Executar a contagem
    const count = await db.ticket.count({
      where: where,
    });

    return NextResponse.json({ count: count });
  } catch (error) {
    console.error('[API_TICKET_COUNT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
