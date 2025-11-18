import { NextResponse } from 'next/server';

import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto'; // Para gerar uma senha segura
import db from '@/app/_lib/prisma';

// 1. Handler POST
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 2.1. Segurança: Obter a sessão e verificar se é SUPER_ADMIN
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const params = await context.params;
    const userId = params.id;

    // 2.2. Impedir que o Admin resete a própria senha (deve usar "Mudar Senha")
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'Não pode resetar a sua própria senha por aqui.' },
        { status: 403 },
      );
    }

    // 2.3. Gerar uma nova senha aleatória
    // (ex: "4a7f1b9e" - 8 caracteres hexadecimais)
    const newPassword = randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 2.4. Atualizar o utilizador no banco
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
      },
    });

    // 2.5. Retornar a senha *em texto simples* (apenas desta vez)
    return NextResponse.json({
      message: 'Senha resetada com sucesso.',
      newPassword: newPassword, // Envia a nova senha para o admin
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_RESET_PASSWORD_ERROR]', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
