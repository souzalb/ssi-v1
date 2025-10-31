import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste o caminho
import db from '@/app/_lib/prisma';

// 1. Schema de Validação (Agora para o Admin)
// O Admin pode (e deve) definir a Role.
const userCreateSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  password: z
    .string()
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' }),
  role: z.nativeEnum(Role), // <-- O Admin define a Role
  areaId: z.string().cuid({ message: 'ID da Área inválido' }).optional(),
});

// --- NOVO GET HANDLER ---
// Retorna todos os usuários (apenas para o Super Admin)
export async function GET() {
  // 2.1. Validar a sessão
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 }); // 403 Forbidden
  }

  try {
    // 2.2. Buscar usuários no banco
    const users = await db.user.findMany({
      // Nunca retornar o hash da senha
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        areaId: true,
        area: {
          select: { name: true }, // Inclui o nome da área
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

// --- MODIFIED POST HANDLER ---
// Cria um novo usuário (apenas para o Super Admin)
export async function POST(req: Request) {
  // 3.1. Validar a sessão
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 }); // 403 Forbidden
  }

  try {
    const body = await req.json();

    // 3.2. Validar o corpo da requisição (novo schema)
    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 },
      );
    }

    // Agora pegamos 'role' do body
    const { email, name, password, role, areaId } = validation.data;

    // 3.3. Verificar se o usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 409 }, // 409 Conflict
      );
    }

    // 3.4. Fazer o Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3.5. Criar o usuário no banco
    const newUser = await db.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        areaId: areaId,
        role: role, // <-- Usamos a Role vinda do Admin
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

    return NextResponse.json(newUser, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('[API_USERS_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
