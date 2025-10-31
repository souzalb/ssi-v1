'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react'; // Importa o signOut do client-side
import { Role } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// --- Componentes Shadcn ---

// Props que o componente recebe do Header (Server Component)
interface UserNavProps {
  name: string;
  email: string;
  role: Role;
  imageUrl: string | null;
}

export function UserNav({ name, email, role, imageUrl }: UserNavProps) {
  // Pega as iniciais do nome para o AvatarFallback
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={imageUrl || ''} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="ml-2 hidden flex-col items-start md:flex">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-muted-foreground text-xs">{email}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Link Condicional para Admin */}
        {role === Role.SUPER_ADMIN && (
          <DropdownMenuItem asChild>
            <Link href="/admin/users">Gerenciar Usuários</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/settings">Configurações</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })} // Redireciona para o login
          className="text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
