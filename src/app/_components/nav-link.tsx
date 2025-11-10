'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../_lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();

  // --- Lógica de Ativação ---
  let isActive = false;
  if (href === '/tickets') {
    // Fica ativo em "/tickets" e "/tickets/[id]",
    // mas NÃO em "/tickets/new"
    isActive = pathname.startsWith('/tickets') && pathname !== '/tickets/new';
  } else {
    // Fica ativo apenas em correspondência exata (para /dashboard e /tickets/new)
    isActive = pathname === href;
  }

  return (
    <Link
      href={href}
      className={cn(
        // Estilos base para todos os links
        'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',

        // Estilos Condicionais
        isActive
          ? 'bg-muted text-primary dark:bg-slate-800/80' // <-- ESTILO ATIVO (fundo destacado)
          : 'text-muted-foreground hover:text-primary hover:bg-muted/50 hover:dark:bg-slate-700/30', // Estilo Inativo
      )}
    >
      {children}
    </Link>
  );
}
