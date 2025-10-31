import { NextResponse } from 'next/server';

import { z } from 'zod';
import { Priority } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// 1. Schema de Validação (O mesmo, está correto)
const ticketCreateSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  location: z.string().min(3, 'Localização é obrigatória'),
  equipment: z.string().min(3, 'Equipamento é obrigatório'),
  model: z.string().min(3, 'Modelo é obrigatório'),
  assetTag: z.string().min(3, 'Patrimônio é obrigatório'),
  priority: z.nativeEnum(Priority),
  areaId: z.string().cuid('ID da Área inválido'),
});

// 2. Handler POST (Substitua o seu por este)
export async function POST(req: Request) {
  // 2.1. Segurança: Obter a sessão
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const requesterId = session.user.id;

  try {
    const body = await req.json();

    // 2.2. Validação dos dados
    const validation = ticketCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    // --- ESTA É A CORREÇÃO ---
    // 1. Separe o 'areaId' do resto dos dados
    const { areaId, ...ticketData } = validation.data;

    // 2.3. Criar o chamado no banco
    const newTicket = await db.ticket.create({
      data: {
        // 2. Use o resto dos dados (sem areaId)
        ...ticketData,

        // 3. Use 'connect' para o solicitante
        requester: {
          connect: { id: requesterId },
        },

        // 4. Use 'connect' para a área (Esta linha estava faltando)
        area: {
          connect: { id: areaId },
        },
      },
      // Retorna o novo chamado criado
      include: {
        requester: { select: { name: true } },
        area: { select: { name: true } },
      },
    });

    return NextResponse.json(newTicket, { status: 201 }); // 201 Created
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_TICKETS_POST_ERROR]', error);
    // Se o areaId não existir (P2025)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'A Área selecionada não existe' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
