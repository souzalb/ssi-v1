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

// --- Importações para Exportação (Segura) ---
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';
import { Trash, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { TicketComRelacoes } from './columns'; // (Importa o tipo do columns.tsx)
import { cn } from '@/app/_lib/utils';

// Tipo para os técnicos que vamos buscar
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
  // Estados da Tabela
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // Estados para Ações em Lote
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
    },
    getRowId: (row) => (row as TicketComRelacoes).id,
  });

  // Buscar Técnicos (para o dropdown)
  useEffect(() => {
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

  // Variáveis derivadas do estado da tabela
  const numSelected = table.getSelectedRowModel().rows.length;
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row) => (row.original as TicketComRelacoes).id,
  );

  // Função: Handle Bulk Update (Status ou Técnico)
  const handleBulkUpdate = async (action: 'status' | 'technician') => {
    setIsLoading(true);
    let body = {};

    if (action === 'status') {
      if (!statusToAction) {
        toast.error('Selecione um status para aplicar.');
        setIsLoading(false);
        return;
      }
      body = { ticketIds: selectedIds, status: statusToAction };
    } else if (action === 'technician') {
      if (!technicianToAction) {
        toast.error('Selecione um técnico para atribuir.');
        setIsLoading(false);
        return;
      }
      body = {
        ticketIds: selectedIds,
        technicianId:
          technicianToAction === 'unassign' ? null : technicianToAction,
      };
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
      router.refresh();
      table.resetRowSelection();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
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
      setIsDeleteAlertOpen(false);
    }
  };

  // Função: Handle Export (Excel ou CSV)
  const handleExport = async (format: 'xlsx' | 'csv') => {
    if (numSelected === 0) {
      toast.error('Nenhum ticket selecionado para exportar.');
      return;
    }

    toast.info(`A gerar o ficheiro ${format.toUpperCase()}...`, {
      id: 'export-toast',
    });
    setIsLoading(true);

    // 1. Mapear os dados selecionados para um formato "limpo"
    const dataToExport = selectedRows.map((row) => {
      const ticket = row.original as TicketComRelacoes;
      return {
        'ID do Ticket': `#${ticket.id.substring(ticket.id.length - 6)}`,
        Título: ticket.title,
        Departamento: ticket.area.name,
        Prioridade: ticket.priority,
        Status: ticket.status,
        'Atribuído a': ticket.technician ? ticket.technician.name : 'N/A',
        Solicitante: ticket.requester.name,
        'Criado em': new Date(ticket.createdAt), // Enviar como Data
        'Resolvido em': ticket.resolvedAt ? new Date(ticket.resolvedAt) : null,
        Avaliação: ticket.satisfactionRating || null,
      };
    });

    // 2. Criar o Workbook e a Worksheet com exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Chamados');

    // 3. Adicionar Cabeçalhos
    worksheet.columns = Object.keys(dataToExport[0]).map((key) => ({
      header: key,
      key: key,
      width: 20, // Largura de coluna padrão
    }));

    // 4. Formatar colunas de Data
    worksheet.getColumn('Criado em').numFmt = 'dd/mm/yyyy hh:mm';
    worksheet.getColumn('Resolvido em').numFmt = 'dd/mm/yyyy hh:mm';

    // 5. Adicionar os dados
    worksheet.addRows(dataToExport);

    // 6. Gerar o ficheiro (Buffer)
    try {
      let buffer: ArrayBuffer;
      let fileType: string;
      let fileName: string;

      if (format === 'xlsx') {
        buffer = await workbook.xlsx.writeBuffer();
        fileType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = 'chamados_exportados.xlsx';
      } else {
        // 'csv'
        buffer = await workbook.csv.writeBuffer();
        fileType = 'text/csv;charset=utf-8;';
        fileName = 'chamados_exportados.csv';
      }

      // 7. Iniciar o Download com FileSaver
      const blob = new Blob([buffer], { type: fileType });
      saveAs(blob, fileName); // O 'saveAs' vem do 'file-saver'

      toast.success('Exportação concluída!', { id: 'export-toast' });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao gerar o ficheiro.', { id: 'export-toast' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- O JSX ---
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
          {/* Linha 1: Contagem e Ações Finais (Exportar, Excluir) */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-muted-foreground flex-1 text-sm font-medium">
              {numSelected} ticket(s) selecionado(s)
            </div>

            <div className="flex items-center gap-2">
              {/* Dropdown de Exportar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
                    CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-red-600" />
                    PDF (.pdf) (em breve)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botão de Excluir (com AlertDialog) */}
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
