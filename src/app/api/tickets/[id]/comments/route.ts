import { NextResponse } from 'next/server';

import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// 1. Schema de Validação
const commentCreateSchema = z.object({
  text: z.string().min(1, 'O comentário não pode estar vazio'),
  isInternal: z.boolean().default(false), // Flag de comentário interno
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

  const userId = session.user.id;
  const params = await context.params;
  const ticketId = params.id;

  try {
    // 2.2. Validar o corpo (body)
    const body = await req.json();
    const validation = commentCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    const { text, isInternal } = validation.data;

    // 2.3. Lógica para o 'areaId' (herdado do ticket)
    // Conforme seu schema, o Comment PRECISA de um areaId.
    // Vamos buscar o areaId do ticket pai.
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      select: { areaId: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Chamado não encontrado' },
        { status: 404 },
      );
    }

    // 2.4. Criar o comentário no banco
    const newComment = await db.comment.create({
      data: {
        text,
        isInternal,
        ticket: { connect: { id: ticketId } }, // Conecta ao ticket
        user: { connect: { id: userId } }, // Conecta ao usuário
        area: { connect: { id: ticket.areaId } }, // Conecta à área (exigido pelo schema)
      },
      // Retorna o comentário com os dados do usuário
      include: {
        user: {
          select: { name: true, role: true, photoUrl: true },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('[API_COMMENTS_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
