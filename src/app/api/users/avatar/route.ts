import { NextResponse } from 'next/server';
import { put } from '@vercel/blob'; // Importa a função 'put' do Vercel Blob

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/_lib/prisma';

export async function POST(req: Request) {
  // 1. Obter a sessão
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Obter o arquivo da requisição
  // O 'req.blob()' é a forma moderna de pegar o body binário
  const blob = await req.blob();
  const filename = req.headers.get('X-Vercel-Blob-Filename') || 'avatar.png';

  if (!blob || blob.size === 0) {
    return NextResponse.json(
      { error: 'Nenhum arquivo enviado' },
      { status: 400 },
    );
  }

  try {
    // 3. Fazer o Upload para o Vercel Blob
    // 'avatars/[userId]/[filename]' -> Cria um path único
    const blobResult = await put(`avatars/${userId}/${filename}`, blob, {
      access: 'public', // O avatar deve ser publicamente visível
      // O 'token' é lido automaticamente da variável de ambiente
    });

    // 4. Salvar a URL no banco de dados
    const newPhotoUrl = blobResult.url;
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        photoUrl: newPhotoUrl,
      },
      select: {
        photoUrl: true, // Retorna apenas o necessário
      },
    });

    // 5. Retornar a nova URL para o frontend
    // O frontend usará isso para atualizar a sessão
    return NextResponse.json({ photoUrl: updatedUser.photoUrl });
  } catch (error) {
    console.error('[API_AVATAR_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao fazer upload' },
      { status: 500 },
    );
  }
}
