import { NextResponse } from 'next/server';
import db from '@/app/_lib/prisma';
import { getSession } from '@/app/_lib/auth';

/**
 * @api {get} /api/users/technicians
 * @description Rota para o Gestor buscar a lista de técnicos da sua própria área.
 */
export async function GET() {
  try {
    const session = await getSession();

    // 1. Trava de segurança: Precisa estar logado
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { user } = session;

    // 2. Trava de permissão: Apenas Gestores podem buscar técnicos
    if (user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas Gestores.' },
        { status: 403 },
      );
    }

    // 3. Trava de dados: O Gestor precisa ter uma área
    if (!user.areaId) {
      return NextResponse.json(
        { error: 'Gestor não está associado a nenhuma área' },
        { status: 400 },
      );
    }

    // 4. Buscar os técnicos da área do gestor
    const technicians = await db.user.findMany({
      where: {
        role: 'TECHNICIAN',
        areaId: user.areaId, // Filtra pela área do gestor logado
      },
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(technicians);
  } catch (error) {
    console.error('Erro ao buscar técnicos:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erro interno desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: errorMessage },
      { status: 500 },
    );
  }
}
