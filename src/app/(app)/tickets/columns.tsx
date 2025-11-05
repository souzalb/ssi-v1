'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Ticket, User, Area, Status, Priority } from '@prisma/client';
import Link from 'next/link';

// Componentes Shadcn
import { Checkbox } from '@/app/_components/ui/checkbox';
import { Badge } from '@/app/_components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar';
import { Button } from '@/app/_components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/app/_lib/utils';

// Tipo do dado que a tabela recebe
// É o 'Ticket' do Prisma + as relações que incluímos
export type TicketComRelacoes = Ticket & {
  requester: Pick<User, 'name'>;
  area: Pick<Area, 'name'>;
  technician: Pick<User, 'name' | 'photoUrl'> | null;
};

// Helper para Avatares
const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Helper para Cores dos Badges
const statusColors: Record<Status, string> = {
  OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
  ASSIGNED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ON_HOLD: 'bg-gray-100 text-gray-800 border-gray-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-800 border-gray-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  URGENT: 'bg-red-100 text-red-800 border-red-200',
};

// Definição das Colunas
export const columns: ColumnDef<TicketComRelacoes>[] = [
  // 1. Coluna de Checkbox (Seleção)
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todas"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. Coluna ID
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <Link
        href={`/tickets/${row.original.id}`}
        className="font-medium text-blue-600 hover:underline"
      >
        #{row.original.id.substring(row.original.id.length - 6)}
      </Link>
    ),
  },

  // 3. Coluna Título (com descrição)
  {
    accessorKey: 'title',
    header: 'Título',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.title}</span>
        <span className="text-muted-foreground max-w-xs truncate text-sm">
          {row.original.description}
        </span>
      </div>
    ),
  },

  // 4. Coluna Departamento (Área)
  {
    accessorKey: 'area',
    header: 'Departamento',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium">
        {row.original.area.name}
      </Badge>
    ),
  },

  // 5. Coluna Prioridade (com cor)
  {
    accessorKey: 'priority',
    header: 'Prioridade',
    cell: ({ row }) => {
      const priority = row.original.priority;
      return (
        <Badge
          className={cn(
            'font-semibold',
            priorityColors[priority] || statusColors.ON_HOLD,
          )}
        >
          {priority}
        </Badge>
      );
    },
  },

  // 6. Coluna Status (com cor)
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={cn(
            'font-semibold',
            statusColors[status] || statusColors.ON_HOLD,
          )}
        >
          {status}
        </Badge>
      );
    },
  },

  // 7. Coluna Atribuído (Avatar)
  {
    accessorKey: 'technician',
    header: 'Atribuído',
    cell: ({ row }) => {
      const tech = row.original.technician;
      if (!tech) {
        return <span className="text-muted-foreground">N/A</span>;
      }
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={tech.photoUrl || ''} alt={tech.name} />
            <AvatarFallback>{getUserInitials(tech.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{tech.name}</span>
        </div>
      );
    },
  },

  // 8. Coluna Criado em
  {
    accessorKey: 'createdAt',
    header: 'Criado em',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {format(new Date(row.original.createdAt), 'dd/MM/yyyy')}
      </span>
    ),
  },

  // 9. Coluna Ações
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/tickets/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalhes
            </Link>
          </DropdownMenuItem>
          {/* (Poderíamos adicionar um link para /tickets/[id]/edit no futuro) */}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
