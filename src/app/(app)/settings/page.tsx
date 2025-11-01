import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

// Importa os Client Components
import { ProfileForm } from './profile-form';
import { PasswordForm } from './password-form';
import db from '@/app/_lib/prisma';
import { AvatarForm } from './avatar-form';

// 1. Função de busca de dados (Server-side)
// (Usamos uma função separada para manter o 'async' fora do componente)
async function getUserData() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  // Buscamos os dados do usuário para pré-preencher o formulário
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      photoUrl: true,
    },
  });

  if (!user) {
    redirect('/login'); // Caso raro de usuário da sessão não estar no DB
  }
  return user;
}

// 2. A Página (Server Component)
export default async function SettingsPage() {
  // 3. Busca os dados no servidor
  const user = await getUserData();

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta.
        </p>
      </header>

      <div className="space-y-8">
        <AvatarForm user={user} />

        {/* 4. Renderiza o formulário de perfil (Client Component) */}
        {/* Passa os dados do servidor como props */}
        <ProfileForm user={user} />

        {/* 5. Renderiza o formulário de senha (Client Component) */}
        <PasswordForm />
      </div>
    </div>
  );
}
