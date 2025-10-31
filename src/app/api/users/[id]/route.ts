import { NextResponse } from 'next/server';

import { z } from 'zod';
import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste este caminho se necessário
import db from '@/app/_lib/prisma';

// 1. Schema de Validação para ATUALIZAÇÃO (PATCH)
// Campos opcionais e sem senha.
const userUpdateSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }).optional(),
  name: z.string().min(3, { message: 'Nome muito curto' }).optional(),
  role: z.nativeEnum(Role).optional(),
  areaId: z.string().cuid().nullable().optional(), // Permite 'null' para remover área
});

// 2. Handler PATCH (Editar Usuário)
export async function PATCH(
  req: Request,
  // CORREÇÃO: 'params' (dentro do context) é uma Promise
  context: { params: Promise<{ id: string }> },
) {
  // 2.1. Validar a sessão (Super Admin)
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  // CORREÇÃO: Fazer o 'await' do context.params
  const params = await context.params;
  const { id } = params; // Agora 'id' terá o valor correto

  // 2.2. Garantir que o admin não mude a própria role
  if (session.user.id === id) {
    const bodyTest = await req.clone().json(); // Clona o request para ler o body
    if (bodyTest.role && bodyTest.role !== Role.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Você não pode rebaixar sua própria conta' },
        { status: 403 },
      );
    }
  }

  try {
    const body = await req.json();

    // 2.3. Validar o corpo
    const validation = userUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    // 2.4. Tratar areaId (se 'undefined' não atualiza, se 'null' remove)
    const dataToUpdate = validation.data;
    if (dataToUpdate.areaId === undefined) {
      delete dataToUpdate.areaId; // Não foi enviado, não mexe
    }

    // 2.5. Atualizar no banco
    const updatedUser = await db.user.update({
      where: { id }, // 'id' agora está correto
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        areaId: true,
      },
    });

    return NextResponse.json(updatedUser);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_USERS_PATCH_ERROR]', error);
    // Tratamento de erro para email duplicado (P2002)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// 3. Handler DELETE (Deletar Usuário)
export async function DELETE(
  req: Request,
  // CORREÇÃO: 'params' (dentro do context) é uma Promise
  context: { params: Promise<{ id: string }> },
) {
  // 3.1. Validar a sessão (Super Admin)
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  // CORREÇÃO: Fazer o 'await' do context.params
  const params = await context.params;
  const { id } = params; // Agora 'id' terá o valor correto

  // 3.2. REGRA DE SEGURANÇA CRÍTICA:
  // Impedir que o Super Admin delete a si mesmo.
  if (session.user.id === id) {
    return NextResponse.json(
      { error: 'Você não pode deletar sua própria conta' },
      { status: 403 }, // 403 Forbidden
    );
  }

  try {
    // 3.3. Deletar o usuário
    await db.user.delete({
      where: { id }, // 'id' agora está correto
    });

    return new NextResponse(null, { status: 204 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_USERS_DELETE_ERROR]', error);
    // (P2025) Usuário não encontrado
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
