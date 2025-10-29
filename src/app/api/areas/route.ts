import { NextResponse } from 'next/server';
// Use o caminho correto para seus helpers
import db from '@/app/_lib/prisma';

/**
 * @api {get} /api/areas
 * @description Rota para buscar todas as Áreas de Manutenção
 * (ex: TI, Predial, Elétrica) para preencher menus dropdown.
 */
export async function GET() {
  try {
    const areas = await db.area.findMany({
      orderBy: {
        name: 'asc', // Ordena por nome (A-Z)
      },
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error('Erro ao buscar áreas:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erro interno desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: errorMessage },
      { status: 500 },
    );
  }
}
