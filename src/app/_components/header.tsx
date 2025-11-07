import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { UserNav } from './user-nav';
import { ChartLineIcon, Cog, PlusCircleIcon, TicketIcon } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { NavLink } from './nav-link';

export async function Header() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const { user } = session;
  const isCommonUser = user.role === 'COMMON';

  return (
    // O cabeçalho agora é escondido em ecrãs pequenos (hidden sm:flex)
    // E fixo no topo, exibido apenas em md:flex ou lg:flex
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 hidden w-full border-b backdrop-blur md:flex">
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
        <nav className="flex items-center gap-4 text-lg font-medium lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Cog className="h-6 w-6" />
            <span>SSI 1.06</span>
          </Link>

          {!isCommonUser && (
            <NavLink href="/dashboard">
              <ChartLineIcon className="h-4 w-4" />
              Dashboard
            </NavLink>
          )}

          <NavLink href="/tickets">
            <TicketIcon className="h-4 w-4" />
            Chamados
          </NavLink>

          <NavLink href="/tickets/new">
            <PlusCircleIcon className="h-4 w-4" />
            Novo Chamado
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <div>
            <ModeToggle />
          </div>
          <div>
            <UserNav
              name={user.name || ''}
              email={user.email || ''}
              role={user.role}
              imageUrl={user.photoUrl}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
