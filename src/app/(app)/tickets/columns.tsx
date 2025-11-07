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
import {
  MoreHorizontal,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/app/_lib/utils';

// Tipo do dado que a tabela recebe - ATUALIZADO COM ticketId
export type TicketComRelacoes = Ticket & {
  ticketId: string; // ← Campo adicionado para ID personalizado
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

// Helper para Cores dos Badges - Status
const statusColors: Record<Status, string> = {
  OPEN: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  ASSIGNED:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  IN_PROGRESS:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  ON_HOLD:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800',
  RESOLVED:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  CLOSED:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  CANCELLED:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

// Helper para Cores dos Badges - Prioridade
const priorityColors: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800',
  MEDIUM:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  URGENT:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

// Labels traduzidas
const statusLabels: Record<Status, string> = {
  OPEN: 'Aberto',
  ASSIGNED: 'Atribuído',
  IN_PROGRESS: 'Em Andamento',
  ON_HOLD: 'Em Espera',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
  CANCELLED: 'Cancelado',
};

const priorityLabels: Record<Priority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

// Componente de Cabeçalho Ordenável
const SortableHeader: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: any;
  title: string;
}> = ({ column, title }) => {
  const isSorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(isSorted === 'asc')}
      className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {title}
      {isSorted === 'asc' && <ArrowUp className="h-4 w-4 text-blue-600" />}
      {isSorted === 'desc' && <ArrowDown className="h-4 w-4 text-blue-600" />}
      {!isSorted && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
    </Button>
  );
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

  // 2. Coluna ID - ATUALIZADO PARA USAR ticketId
  {
    accessorKey: 'ticketId',
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <Link
        href={`/tickets/${row.original.id}`}
        className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
      >
        {row.original.ticketId ||
          `#${row.original.id.substring(row.original.id.length - 6)}`}
      </Link>
    ),
  },

  // 3. Coluna Título (com descrição)
  {
    accessorKey: 'title',
    header: ({ column }) => <SortableHeader column={column} title="Título" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {row.original.title}
        </span>
        {row.original.description && (
          <span className="text-muted-foreground max-w-xs truncate text-sm">
            {row.original.description}
          </span>
        )}
      </div>
    ),
  },

  // 4. Coluna Departamento (Área)
  {
    accessorKey: 'area',
    header: 'Departamento',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="border-slate-300 bg-slate-50 font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        {row.original.area.name}
      </Badge>
    ),
  },

  // 5. Coluna Prioridade (com cor e label traduzida)
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <SortableHeader column={column} title="Prioridade" />
    ),
    cell: ({ row }) => {
      const priority = row.original.priority;
      return (
        <Badge
          className={cn(
            'font-semibold',
            priorityColors[priority] || priorityColors.MEDIUM,
          )}
        >
          {priorityLabels[priority] || priority}
        </Badge>
      );
    },
  },

  // 6. Coluna Status (com cor e label traduzida)
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={cn(
            'font-semibold',
            statusColors[status] || statusColors.ON_HOLD,
          )}
        >
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },

  // 7. Coluna Atribuído (Avatar com tooltip)
  {
    accessorKey: 'technician',
    header: 'Atribuído',
    cell: ({ row }) => {
      const tech = row.original.technician;
      if (!tech) {
        return (
          <span className="text-muted-foreground text-sm italic">
            Não atribuído
          </span>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-slate-200 dark:border-slate-700">
            <AvatarImage src={tech.photoUrl || ''} alt={tech.name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {getUserInitials(tech.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {tech.name}
          </span>
        </div>
      );
    },
  },

  // 8. Coluna Criado em (formatação melhorada)
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <SortableHeader column={column} title="Criado em" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {format(new Date(row.original.createdAt), 'dd/MM/yyyy')}
        </span>
        <span className="text-muted-foreground text-xs">
          {format(new Date(row.original.createdAt), 'HH:mm')}
        </span>
      </div>
    ),
  },

  // 9. Coluna Ações
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link
              href={`/tickets/${row.original.id}`}
              className="flex cursor-pointer items-center"
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalhes
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
