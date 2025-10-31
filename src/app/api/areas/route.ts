import db from '@/app/_lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const areas = await db.area.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error('[API_AREAS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar áreas' },
      { status: 500 },
    );
  }
}
