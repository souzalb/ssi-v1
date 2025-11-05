'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table';
import { User } from '@prisma/client';

// --- Componentes ---
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/_components/ui/table'; // (Ajuste o caminho se necessário)
import { Card, CardContent } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/_components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';
import { Label } from '@/app/_components/ui/label';
import { Trash, Download, Loader2 } from 'lucide-react';
import { TicketComRelacoes } from './columns'; // (Importa o tipo do columns.tsx)
import { cn } from '@/app/_lib/utils';

// Tipo para os técnicos que vamos buscar

/* eslint-disable @typescript-eslint/no-unused-vars */
type Technician = Pick<User, 'id' | 'name'>;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  statuses: string[]; // Recebe os status do Server Component
}

export function DataTable<TData, TValue>({
  columns,
  data,
  statuses,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Estados para as ações em lote
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [statusToAction, setStatusToAction] = useState<string>('');
  const [technicianToAction, setTechnicianToAction] = useState<string>('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection,
      sorting,
      // (Poderíamos adicionar paginação e filtros aqui,
      // mas estamos a controlá-los via URL no Server Component)
    },
    // Permite que 'data-table' saiba como obter o ID de uma linha
    getRowId: (row) => (row as TicketComRelacoes).id,
  });

  // Buscar Técnicos (para o dropdown)
  useEffect(() => {
    // Busca a lista de técnicos quando o componente é montado
    const fetchTechnicians = async () => {
      try {
        const response = await fetch('/api/users?role=TECHNICIAN');
        const data = await response.json();
        if (data && !data.error) {
          setTechnicians(data);
        }
      } catch (error) {
        console.error('Falha ao buscar técnicos', error);
      }
    };
    fetchTechnicians();
  }, []); // O array vazio garante que rode apenas uma vez

  // Lógica do Toolbar
  const numSelected = table.getSelectedRowModel().rows.length;
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => (row.original as TicketComRelacoes).id);

  // Função: Handle Bulk Update (Status ou Técnico)
  const handleBulkUpdate = async (action: 'status' | 'technician') => {
    setIsLoading(true);
    let body = {};
    let successMessage = '';

    if (action === 'status') {
      if (!statusToAction) {
        toast.error('Selecione um status para aplicar.');
        setIsLoading(false);
        return;
      }
      body = { ticketIds: selectedIds, status: statusToAction };
      successMessage = `Status de ${selectedIds.length} chamado(s) atualizado.`;
    } else if (action === 'technician') {
      if (!technicianToAction) {
        toast.error('Selecione um técnico para atribuir.');
        setIsLoading(false);
        return;
      }
      body = {
        ticketIds: selectedIds,
        // Envia 'null' se o utilizador selecionar "Não atribuído"
        technicianId:
          technicianToAction === 'unassign' ? null : technicianToAction,
      };
      successMessage = `${selectedIds.length} chamado(s) atribuído(s).`;
    }

    try {
      const response = await fetch('/api/tickets/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao atualizar chamados');
      }

      toast.success(result.message);

      // Força o Server Component a buscar os dados novamente
      router.refresh();
      // Limpa a seleção
      table.resetRowSelection();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
      // Reseta os dropdowns
      setStatusToAction('');
      setTechnicianToAction('');
    }
  };

  // Função: Handle Delete (Exclusão em Lote)
  const handleDeleteSelected = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/tickets/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketIds: selectedIds }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao excluir chamados');
      }

      toast.success(result.message);

      router.refresh();
      table.resetRowSelection();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
      setIsDeleteAlertOpen(false); // Fecha o pop-up
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* --- TOOLBAR DE AÇÕES EM LOTE --- */}
        <div
          className={cn(
            'space-y-4 rounded-lg border p-4',
            numSelected > 0 ? 'bg-muted/50' : 'hidden', // Mostra todo o bloco
          )}
        >
          {/* Linha 1: Contagem e Ações Finais */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-muted-foreground flex-1 text-sm font-medium">
              {numSelected} ticket(s) selecionado(s)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Lógica de Exportar a implementar...')}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>

              <AlertDialog
                open={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="mr-2 h-4 w-4" />
                    )}
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. {numSelected} chamado(s)
                      serão permanentemente excluídos da base de dados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSelected}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Excluindo...' : 'Sim, excluir'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Linha 2: Ações de Atualização (Status e Atribuição) */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {/* Bloco Atualizar Status */}
            <div className="flex-1 space-y-2">
              <Label>Atualizar Status</Label>
              <div className="flex gap-2">
                <Select
                  value={statusToAction}
                  onValueChange={setStatusToAction}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Usa a prop 'statuses' vinda do Server Component */}
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => handleBulkUpdate('status')}
                  disabled={isLoading || !statusToAction}
                >
                  Aplicar
                </Button>
              </div>
            </div>

            {/* Bloco Atribuir Usuário */}
            <div className="flex-1 space-y-2">
              <Label>Atribuir Usuário</Label>
              <div className="flex gap-2">
                <Select
                  value={technicianToAction}
                  onValueChange={setTechnicianToAction}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar usuário..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassign">Não atribuído</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => handleBulkUpdate('technician')}
                  disabled={isLoading || !technicianToAction}
                >
                  Atribuir
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Tabela --- */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum resultado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
