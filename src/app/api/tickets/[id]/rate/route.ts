import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Status } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// 1. Schema de Validação
// A nota deve ser um número inteiro entre 1 e 5
const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

// 2. Handler POST
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 2.1. Segurança: Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2.2. Obter ID do Chamado
  const params = await context.params;
  const ticketId = params.id;
  const userId = session.user.id;

  try {
    // 2.3. Validar o corpo (body)
    const body = await req.json();
    const validation = ratingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Avaliação inválida (deve ser de 1 a 5)' },
        { status: 400 },
      );
    }

    const { rating } = validation.data;

    // 2.4. Obter o chamado para verificar permissões
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      select: {
        requesterId: true, // ID de quem abriu
        status: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Chamado não encontrado' },
        { status: 404 },
      );
    }

    // --- 2.5. REGRAS DE NEGÓCIO E SEGURANÇA ---

    // REGRA 1: Apenas o solicitante pode avaliar
    if (ticket.requesterId !== userId) {
      return NextResponse.json(
        { error: 'Apenas o solicitante pode avaliar este chamado' },
        { status: 403 }, // Forbidden
      );
    }

    // REGRA 2: Apenas chamados concluídos podem ser avaliados
    if (ticket.status !== Status.RESOLVED && ticket.status !== Status.CLOSED) {
      return NextResponse.json(
        { error: 'Apenas chamados resolvidos ou fechados podem ser avaliados' },
        { status: 403 },
      );
    }

    // 2.6. Salvar a avaliação no banco
    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: {
        satisfactionRating: rating,
      },
    });

    return NextResponse.json(updatedTicket);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_TICKET_RATE_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
