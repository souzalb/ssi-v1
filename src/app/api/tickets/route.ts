import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Priority, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import React from 'react';

// --- 1. NOVAS IMPORTAÇÕES ---
import db from '@/app/_lib/prisma'; // (O seu caminho para o Prisma)
import { fromEmail, resend } from '@/app/_lib/resend'; // (O seu caminho para o Resend)
import { NewTicketEmail } from '@/emails/new-ticket-email';
import { addBusinessDays } from 'date-fns'; // <-- IMPORTAÇÃO DA DATE-FNS

// --- Schemas (sem alteração) ---
const attachmentSchema = z.object({
  url: z.string().url('URL do anexo inválida'),
  filename: z.string().min(1, 'Nome do arquivo do anexo inválido'),
  fileType: z.string().optional(),
  size: z.number().int().positive().optional(),
});

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
  attachments: z.array(attachmentSchema).optional(),
});

// 3. Handler POST (Modificado)
export async function POST(req: Request) {
  // 3.1. Segurança: Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await req.json();

    // 3.2. Validação
    const validation = ticketCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    // 3.3. Separar os dados
    const { areaId, attachments, ...ticketData } = validation.data;

    // --- 4. NOVO: Lógica de Cálculo do SLA ---
    const now = new Date();
    let slaDeadline: Date | null = null;

    switch (ticketData.priority) {
      case Priority.URGENT:
        slaDeadline = addBusinessDays(now, 1);
        break;
      case Priority.HIGH:
        slaDeadline = addBusinessDays(now, 3);
        break;
      case Priority.MEDIUM:
        slaDeadline = addBusinessDays(now, 5);
        break;
      case Priority.LOW:
        slaDeadline = addBusinessDays(now, 10);
        break;
    }
    // --- FIM DA LÓGICA DE SLA ---

    // 3.4. Criar o chamado e os anexos (Transacional)
    const newTicket = await db.ticket.create({
      data: {
        ...ticketData,
        slaDeadline: slaDeadline, // <-- 5. SALVA O PRAZO NO BANCO
        requester: {
          connect: { id: userId },
        },
        area: {
          connect: { id: areaId },
        },
        ...(attachments &&
          attachments.length > 0 && {
            attachments: {
              createMany: {
                data: attachments.map((att) => ({
                  ...att,
                  uploaderId: userId,
                })),
              },
            },
          }),
      },
      include: {
        requester: { select: { name: true } },
        area: { select: { name: true } },
        attachments: true,
      },
    });
    // --- 4. NOVO: Lógica de Envio de Email (Fire-and-Forget) ---
    try {
      // 4.1. Encontrar o(s) gestor(es) da área
      const managers = await db.user.findMany({
        where: {
          role: Role.MANAGER,
          areaId: newTicket.areaId, // A área do ticket recém-criado
        },
        select: {
          email: true,
          name: true,
        },
      });

      if (
        managers.length > 0 &&
        fromEmail &&
        process.env.NEXT_PUBLIC_BASE_URL
      ) {
        // 4.2. Preparar os dados do email
        const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/${newTicket.id}`;

        // Envia para cada gestor
        for (const manager of managers) {
          if (!manager.email || !manager.name) continue;

          await resend.emails.send({
            from: fromEmail,
            to: manager.email,
            subject: `Novo Chamado #${newTicket.id}: ${newTicket.title}`,

            // Renderiza o componente React como o corpo do email
            react: React.createElement(NewTicketEmail, {
              managerName: manager.name,
              requesterName: newTicket.requester.name,
              ticketTitle: newTicket.title,
              ticketPriority: newTicket.priority,
              ticketUrl: ticketUrl,
            }),
          });
        }
      } else {
        if (!fromEmail || !process.env.NEXT_PUBLIC_BASE_URL) {
          console.warn(
            'AVISO: EMAIL_FROM ou NEXT_PUBLIC_BASE_URL não definidos. Email não enviado.',
          );
        }
        if (managers.length === 0) {
          console.warn(
            `Nenhum gestor encontrado para a área ${newTicket.area.name}. Email não enviado.`,
          );
        }
      }
    } catch (emailError) {
      // Se o email falhar, o chamado já foi criado.
      // Apenas logamos o erro, mas não falhamos a requisição.
      console.error('[API_TICKETS_POST_EMAIL_ERROR]', emailError);
    }

    // 5. Retorna o sucesso
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
