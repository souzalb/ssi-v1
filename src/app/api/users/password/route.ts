import { NextResponse } from 'next/server';

import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import db from '@/app/_lib/prisma';

// 1. Schema de Validação
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
});

export async function POST(req: Request) {
  // 2. Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();

    // 3. Validar o body
    const validation = passwordChangeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // 4. Buscar o usuário (para pegar o hash da senha)
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );
    }

    // 5. Verificar a senha atual
    const passwordsMatch = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordsMatch) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 403 }, // Forbidden
      );
    }

    // 6. Gerar o hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 7. Atualizar a senha no banco
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json(
      { message: 'Senha alterada com sucesso' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[API_PASSWORD_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
