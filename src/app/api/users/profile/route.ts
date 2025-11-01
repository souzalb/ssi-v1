import { NextResponse } from 'next/server';

import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// 1. Schema de Validação
const profileUpdateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
});

export async function PATCH(req: Request) {
  // 2. Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 3. Pegar o ID do usuário *da sessão*
  const userId = session.user.id;

  try {
    const body = await req.json();

    // 4. Validar o body
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    const { name } = validation.data;

    // 5. Atualizar o usuário no banco
    const updatedUser = await db.user.update({
      where: { id: userId }, // Atualiza o ID da sessão
      data: {
        name: name,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[API_PROFILE_PATCH_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
