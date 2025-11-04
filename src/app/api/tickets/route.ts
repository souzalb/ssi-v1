import { NextResponse } from 'next/server';

import { z } from 'zod';
import { Priority } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// --- 1. NOVO: Schema para um Anexo (espelha a resposta da API de upload) ---
const attachmentSchema = z.object({
  url: z.string().url('URL do anexo inválida'),
  filename: z.string().min(1, 'Nome do arquivo do anexo inválido'),
  fileType: z.string().optional(),
  size: z.number().int().positive().optional(),
});

// --- 2. MODIFICADO: Schema de Criação do Chamado ---
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

  // --- NOVO CAMPO: Aceita um array de anexos ---
  attachments: z.array(attachmentSchema).optional(),
});

// 3. Handler POST (Modificado)
export async function POST(req: Request) {
  // 3.1. Segurança: Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // O 'requesterId' também será o 'uploaderId' dos anexos
  const userId = session.user.id;

  try {
    const body = await req.json();

    // 3.2. Validação (agora inclui os anexos)
    const validation = ticketCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    // 3.3. Separar os dados
    const { areaId, attachments, ...ticketData } = validation.data;

    // 3.4. Criar o chamado e os anexos (Transacional)
    const newTicket = await db.ticket.create({
      data: {
        // Dados do Ticket (title, description, etc.)
        ...ticketData,

        // Relação com o Solicitante
        requester: {
          connect: { id: userId },
        },

        // Relação com a Área
        area: {
          connect: { id: areaId },
        },

        // --- 3.5. NOVO: Bloco de criação de anexos ---
        // Cria os anexos "aninhados" dentro do ticket
        ...(attachments &&
          attachments.length > 0 && {
            attachments: {
              createMany: {
                data: attachments.map((att) => ({
                  ...att, // url, filename, fileType, size
                  uploaderId: userId, // Associa o upload ao usuário logado
                })),
              },
            },
          }),
      },
      // Retorna o novo chamado com os anexos
      include: {
        requester: { select: { name: true } },
        area: { select: { name: true } },
        attachments: true, // <-- Inclui os anexos na resposta
      },
    });

    return NextResponse.json(newTicket, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[API_TICKETS_POST_ERROR]', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'A Área selecionada ou o Usuário não existe' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
