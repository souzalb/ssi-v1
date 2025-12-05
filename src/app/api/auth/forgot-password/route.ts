import { NextResponse } from 'next/server';

import { z } from 'zod';
import { randomBytes } from 'crypto';

import { ResetPasswordEmail } from '@/emails/reset-password-email';
import React from 'react';
import db from '@/app/_lib/prisma';
import { fromEmail, resend } from '@/app/_lib/resend';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // 1. Verificar se o utilizador existe
    const user = await db.user.findUnique({ where: { email } });

    // Por segurança, mesmo que não exista, respondemos "Sucesso" para não revelar emails cadastrados.
    // Mas num sistema interno, podemos ser mais diretos se preferir.
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // 2. Gerar Token e Expiração (1 hora)
    const token = randomBytes(32).toString('hex');
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    // 3. Salvar no Banco (limpa tokens antigos primeiro)
    await db.passwordResetToken.deleteMany({ where: { email } });
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // 4. Enviar Email
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    if (fromEmail) {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Redefinição de Senha - SSI',
        react: React.createElement(ResetPasswordEmail, {
          userFirstname: user.name.split(' ')[0],
          resetPasswordLink: resetLink,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
