import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/app/_lib/prisma';
import { getSession } from '@/app/_lib/auth';

// --- Validação (BACK-END) ---
const assignTicketSchema = z.object({
  technicianId: z
    .string()
    .uuid('ID do técnico deve ser um UUID válido')
    .min(1, 'ID do técnico é obrigatório'),
});

/**
 * @api {patch} /api/tickets/[id]
 * @description Rota para o Gestor atribuir um chamado a um técnico.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // 👈 note o Promise aqui
) {
  try {
    const session = await getSession();
    const { id } = await params; // 👈 e o await aqui

    // 1. Trava de segurança
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { user } = session;

    // 2. Trava de permissão
    if (user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas Gestores.' },
        { status: 403 },
      );
    }

    if (!user.areaId) {
      return NextResponse.json(
        { error: 'Gestor não está associado a nenhuma área' },
        { status: 400 },
      );
    }

    // 3. Validação do corpo
    const body = await req.json();
    const parsedBody = assignTicketSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', issues: parsedBody.error.message },
        { status: 400 },
      );
    }

    const { technicianId } = parsedBody.data;

    // 4. Verifica se o chamado existe e pertence à área
    const ticket = await db.ticket.findFirst({
      where: {
        id,
        areaId: user.areaId,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Chamado não encontrado ou fora da sua área de gestão' },
        { status: 404 },
      );
    }

    // 5. Verifica se o técnico existe e pertence à área
    const technician = await db.user.findFirst({
      where: {
        id: technicianId,
        role: 'TECHNICIAN',
        areaId: user.areaId,
      },
    });

    if (!technician) {
      return NextResponse.json(
        { error: 'Técnico não encontrado ou não pertence a esta área' },
        { status: 404 },
      );
    }

    // 6. Atualiza o chamado
    const updatedTicket = await db.ticket.update({
      where: { id },
      data: {
        technicianId,
        status: 'ASSIGNED',
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Erro ao atribuir chamado:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erro interno desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: errorMessage },
      { status: 500 },
    );
  }
}
