import { NextResponse } from 'next/server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import db from '@/app/_lib/prisma';

/* eslint-disable */

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = resetSchema.parse(body);

    // 1. Buscar token válido
    const existingToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    // 2. Verificar expiração
    if (new Date() > existingToken.expires) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 });
    }

    // 3. Atualizar senha do utilizador
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { email: existingToken.email },
      data: { passwordHash: hashedPassword },
    });

    // 4. Deletar o token usado
    await db.passwordResetToken.delete({ where: { id: existingToken.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao resetar' }, { status: 500 });
  }
}
