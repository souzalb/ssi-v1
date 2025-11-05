import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { UserNav } from './user-nav'; // O Client Component que criamos
import { Package2 } from 'lucide-react'; // Um ícone para o Logo

export async function Header() {
  // Busca a sessão no servidor
  const session = await getServerSession(authOptions);

  // Se (por algum motivo) não houver sessão, não renderiza nada
  if (!session || !session.user) {
    return null;
  }

  const { user } = session;

  const isCommonUser = user.role === 'COMMON';

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center px-4 md:px-8">
        {/* Logo e Links Principais */}
        <nav className="flex items-center gap-6 text-lg font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">SS</span>
          </Link>
          {!isCommonUser && (
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/tickets"
            className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            Chamados
          </Link>

          <Link
            href="/tickets/new"
            className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            Novo Chamado
          </Link>
        </nav>

        {/* UserNav na Direita */}
        <div className="flex flex-1 items-center justify-end">
          <UserNav
            name={user.name || ''}
            email={user.email || ''}
            role={user.role}
            imageUrl={user.photoUrl}
          />
        </div>
      </div>
    </header>
  );
}
