/* eslint-disable */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Usa o hook de sessão do cliente
import { LayoutGrid, TicketIcon, Plus, User, Cog } from 'lucide-react';
import { Role } from '@prisma/client';
import { useState, useEffect } from 'react'; // Importa useState e useEffect
import { cn } from '../_lib/utils';

interface MobileBottomNavProps {
  // (Props removidas, pois 'useSession' trata de tudo)
}

interface MobileNavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  currentPath: string;
  badge?: number; // Badge opcional para notificações
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
  currentPath,
  badge,
}: MobileNavLinkProps) {
  const isActive =
    href === '/tickets'
      ? currentPath.startsWith('/tickets') && currentPath !== '/tickets/new'
      : currentPath === href;

  return (
    <Link
      href={href}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all duration-200',
        'active:scale-95', // Feedback tátil
      )}
    >
      {/* Container do ícone com background animado */}
      <div className="relative">
        {/* Background blur effect quando ativo */}
        {isActive && (
          <div className="bg-primary/10 animate-in fade-in zoom-in-95 absolute inset-0 -m-2 rounded-2xl blur-xl duration-300" />
        )}

        {/* Ícone com animação suave */}
        <div
          className={cn(
            'relative rounded-2xl px-4 py-2 transition-all duration-300',
            isActive && 'bg-primary/10',
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5 transition-all duration-300',
              isActive ? 'text-primary scale-110' : 'text-muted-foreground',
            )}
            strokeWidth={isActive ? 2.5 : 2}
          />

          {/* Badge de notificação */}
          {badge !== undefined && badge > 0 && (
            <div className="bg-destructive animate-in zoom-in-50 absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-lg">
              {badge > 99 ? '99+' : badge}
            </div>
          )}
        </div>
      </div>

      {/* Label com fade in/out suave */}
      <span
        className={cn(
          'text-[11px] font-medium transition-all duration-300',
          isActive
            ? 'text-primary translate-y-0 opacity-100'
            : 'text-muted-foreground translate-y-0.5 opacity-70',
        )}
      >
        {label}
      </span>

      {/* Indicador inferior (bolinha) */}
      {isActive && (
        <div className="bg-primary animate-in slide-in-from-bottom-2 absolute bottom-0 h-1 w-12 rounded-t-full duration-300" />
      )}
    </Link>
  );
}

export function MobileBottomNav({}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // --- 1. ESTADO E EFEITO PARA O BADGE ---
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    // Se o utilizador estiver logado, busca a contagem
    if (status === 'authenticated') {
      const fetchTicketCount = async () => {
        try {
          const response = await fetch('/api/users/ticket-count');
          if (!response.ok) {
            throw new Error('Falha ao buscar contagem');
          }
          const data = await response.json();
          setTicketCount(data.count);
        } catch (error) {
          console.error('Erro ao buscar contagem de chamados:', error);
          setTicketCount(0); // Zera em caso de erro
        }
      };

      fetchTicketCount();

      // (Opcional: Pode re-validar a contagem periodicamente)
    }
  }, [status, pathname]); // Recarrega a contagem se a sessão mudar OU se a rota mudar

  // Lógica de Renderização (não renderiza se não estiver logado)
  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  const { role } = session.user;
  const isSuperAdmin = role === Role.SUPER_ADMIN;
  const isCommonUser = role === Role.COMMON;

  return (
    <>
      {/* Safe area para iPhones e Android com gestos (placeholder) */}
      <div className="h-16 md:hidden dark:bg-slate-950" />

      {/* Navigation bar com glassmorphism */}
      <nav
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50 md:hidden',
          'bg-background/80 border-t backdrop-blur-xl',
          'supports-backdrop-filter:bg-background/60',
          'shadow-[0_-4px_16px_rgba(0,0,0,0.04)]',
        )}
      >
        <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-2">
          {!isCommonUser && (
            <MobileNavLink
              href="/dashboard"
              label="Início"
              icon={LayoutGrid}
              currentPath={pathname}
            />
          )}

          {/* --- 2. BADGE ATUALIZADO --- */}
          <MobileNavLink
            href="/tickets"
            label="Chamados"
            icon={TicketIcon}
            currentPath={pathname}
            badge={ticketCount} // <-- Usa o estado dinâmico
          />

          {/* Botão FAB Central Elevado */}
          <div className="relative -mt-6 flex flex-1 justify-center">
            <Link
              href="/tickets/new"
              className={cn(
                'group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
                'bg-primary text-primary-foreground',
                'hover:scale-105 active:scale-95',
                'before:bg-primary/30 before:absolute before:inset-0 before:animate-ping before:rounded-full before:duration-1000',
                pathname === '/tickets/new' &&
                  'ring-primary/30 scale-110 ring-4',
              )}
            >
              <Plus
                className={cn(
                  'relative z-10 h-6 w-6 transition-transform duration-300',
                  'group-hover:rotate-90',
                )}
                strokeWidth={2.5}
              />
              <span className="sr-only">Novo Chamado</span>
            </Link>
          </div>

          {/* Admin/Perfil */}
          {isSuperAdmin ? (
            <MobileNavLink
              href="/admin/users"
              label="Admin"
              icon={Cog}
              currentPath={pathname}
            />
          ) : (
            <MobileNavLink
              href="/settings"
              label="Perfil"
              icon={User}
              currentPath={pathname}
            />
          )}

          {/* Perfil (apenas Super Admin) */}
          {isSuperAdmin && (
            <MobileNavLink
              href="/settings"
              label="Perfil"
              icon={User}
              currentPath={pathname}
            />
          )}
        </div>

        {/* Safe area para dispositivos com notch/barra de gestos */}
        <div className="bg-background/80 h-[env(safe-area-inset-bottom)] backdrop-blur-xl" />
      </nav>
    </>
  );
}
