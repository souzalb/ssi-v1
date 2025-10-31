import { NextResponse, NextRequest } from 'next/server'; // Importe NextRequest
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

// --- Schema de Criação (POST) - (Sem alterações) ---
const userCreateSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  password: z
    .string()
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' }),
  role: z.nativeEnum(Role),
  areaId: z.string().cuid({ message: 'ID da Área inválido' }).optional(),
});

// --- MODIFIED GET HANDLER ---
// Retorna usuários com base na permissão e filtros
export async function GET(req: NextRequest) {
  // Use NextRequest para ler a URL
  // 2.1. Validar a sessão
  const session = await getServerSession(authOptions);

  // Acesso permitido para Super Admin OU Manager
  if (
    !session ||
    (session.user.role !== Role.SUPER_ADMIN &&
      session.user.role !== Role.MANAGER)
  ) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  // 2.2. Construção da Query (Where) com base na Role
  const { searchParams } = new URL(req.url);
  const roleFilter = searchParams.get('role'); // Filtro: /api/users?role=TECHNICIAN

  const where: Prisma.UserWhereInput = {};

  // Se for Manager, filtra pela sua própria área
  if (session.user.role === Role.MANAGER) {
    if (!session.user.areaId) {
      // Manager sem área não pode ver ninguém
      return NextResponse.json(
        { error: 'Gestor não associado a uma área' },
        { status: 403 },
      );
    }
    where.areaId = session.user.areaId;
  }

  // Se o filtro de Role for aplicado
  if (roleFilter) {
    // Validação simples para garantir que a Role é válida
    if (Object.values(Role).includes(roleFilter as Role)) {
      where.role = roleFilter as Role;
    } else {
      return NextResponse.json({ error: 'Role inválida' }, { status: 400 });
    }
  }

  try {
    // 2.3. Buscar usuários no banco
    const users = await db.user.findMany({
      where, // Aplica os filtros
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        areaId: true,
        area: {
          select: { name: true },
        },
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('[API_USERS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// --- POST HANDLER (Sem alterações) ---
// Cria um novo usuário (apenas para o Super Admin)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    const { email, name, password, role, areaId } = validation.data;
    const existingUser = await db.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        areaId: areaId,
        role: role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        areaId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('[API_USERS_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
