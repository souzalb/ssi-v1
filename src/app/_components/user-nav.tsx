'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Role } from '@prisma/client';

// --- 1. Importar os ícones ---
import { User, LogOut, MoreHorizontal, HelpCircleIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// --- Componentes Shadcn (assumindo que estão em /components/ui) ---

// Props (sem alteração)
interface UserNavProps {
  name: string;
  email: string;
  role: Role;
  imageUrl: string | null;
}

export function UserNav({ name, email, imageUrl }: UserNavProps) {
  // Pega as iniciais do nome para o AvatarFallback (sem alteração)
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      {/* --- 2. O NOVO GATILHO (TRIGGER) --- */}
      {/* (Inspirado no layout do 'SidebarMenuButton' do seu exemplo) */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          // O 'h-auto' permite que o botão se ajuste ao conteúdo
          // O 'p-2' dá um bom espaçamento
          className="flex h-auto w-full justify-start gap-3 p-2"
        >
          {/* Avatar (com tamanho ligeiramente menor) */}
          <Avatar className="h-9 w-9">
            <AvatarImage src={imageUrl || undefined} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {/* Nome e Email (escondidos em ecrãs pequenos 'hidden md:grid') */}
          <div className="hidden flex-1 grid-cols-1 text-left text-sm leading-tight md:grid">
            <span className="truncate font-medium">{name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {email}
            </span>
          </div>

          {/* Ícone de "Mais Opções" (escondido em ecrãs pequenos) */}
          <MoreHorizontal className="text-muted-foreground ml-auto hidden size-4 md:block" />
        </Button>
      </DropdownMenuTrigger>

      {/* --- 3. O NOVO CONTEÚDO DO MENU --- */}
      <DropdownMenuContent
        className="min-w-56 rounded-lg" // (Estilo do seu exemplo)
        align="end"
        sideOffset={4}
      >
        {/* Etiqueta do Menu (como no seu exemplo) */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-9 w-9">
              <AvatarImage src={imageUrl || undefined} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Link para Configurações (com ícone) */}
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Minha Conta</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Link para Configurações (com ícone) */}
          <DropdownMenuItem asChild>
            <Link
              href="https://drive.google.com/file/d/1c10d6YQfQVFlEUJ3qgx_3hPmkT9-cdeS/view?usp=drive_link"
              className="cursor-pointer"
              target="_blank"
            >
              <HelpCircleIcon className="mr-2 h-4 w-4" />
              <span>Manual</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sair (com ícone) */}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="cursor-pointer focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-800/20"
        >
          <LogOut className="mr-2 h-4 w-4 focus:text-red-600 dark:focus:text-red-700" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
