import { NextResponse } from 'next/server';
import { z } from 'zod';
// Use os caminhos corretos para seus helpers
import db from '@/app/_lib/prisma';
import { getSession } from '@/app/_lib/auth';
import { Prisma } from '@prisma/client';

// --- Validação (BACK-END) ---
// Esta é a validação de segurança.
// O front-end já checou se o campo está vazio (min(1)).
// O back-end APENAS checa se o tipo está correto (ex: uuid).
const createTicketSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  areaId: z.string().cuid('O ID da área é inválido'), // Correção: Apenas checa o UUID
  location: z.string().min(1, 'A localização é obrigatória'),
  equipment: z.string().min(1, 'O equipamento é obrigatório'),
  model: z.string().min(1, 'O modelo é obrigatório'),
  assetTag: z.string().min(1, 'O número de patrimônio é obrigatório'),
});

// --- Rota GET (Listar Chamados) ---
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { user } = session;

    const whereClause: Prisma.TicketWhereInput = {};

    switch (user.role) {
      case 'COMMON':
        whereClause.requesterId = user.id;
        break;
      case 'TECHNICIAN':
        whereClause.technicianId = user.id;
        break;
      case 'MANAGER':
        if (!user.areaId) {
          return NextResponse.json(
            { error: 'Gestor não está associado a nenhuma área' },
            { status: 403 },
          );
        }
        whereClause.areaId = user.areaId;
        break;
      case 'SUPER_ADMIN':
        // Vê tudo
        break;
      default:
        return NextResponse.json(
          { error: 'Permissão inválida' },
          { status: 403 },
        );
    }

    const tickets = await db.ticket.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { name: true, photoUrl: true } },
        technician: { select: { name: true, photoUrl: true } },
        area: { select: { name: true } },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erro interno desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: errorMessage },
      { status: 500 },
    );
  }
}

// --- Rota POST (Criar Chamado) ---
export async function POST(req: Request) {
  try {
    // 1. Verificar usuário (quem está abrindo o chamado?)
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { user } = session;

    // 2. Ler e validar os dados do corpo da requisição
    const body = await req.json();
    const parsedBody = createTicketSchema.safeParse(body);

    // 3. Se a validação falhar, retorna o erro (É AQUI QUE DAVA "DADOS INVÁLIDOS")
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', issues: parsedBody.error.message },
        { status: 400 },
      );
    }

    // 4. Se a validação for bem-sucedida, 'data' contém os dados seguros
    const { title, description, areaId, location, equipment, model, assetTag } =
      parsedBody.data;

    // 5. Criar o chamado no banco de dados
    const newTicket = await db.ticket.create({
      data: {
        title,
        description,
        location,
        equipment,
        model,
        assetTag,
        areaId: areaId,
        requesterId: user.id,
        // Status e Prioridade usarão os valores padrão do schema.prisma
      },
    });

    // 6. Retornar o novo chamado criado
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar chamado:', error);

    // Tratar erros específicos do Prisma (ex: chave estrangeira inválida)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // Falha na restrição de chave estrangeira (ex: areaId não existe)
        return NextResponse.json(
          { error: 'ID da Área ou do Solicitante não encontrado' },
          { status: 404 },
        );
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Erro interno desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: errorMessage },
      { status: 500 },
    );
  }
}
