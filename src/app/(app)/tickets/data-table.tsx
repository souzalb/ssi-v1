'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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

// Importações para Exportação
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable, { type UserOptions } from 'jspdf-autotable';

// Componentes
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/_components/ui/table';
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
import { TicketComRelacoes } from './columns';
import { cn } from '@/app/_lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Interface para o hook do autotable
interface AutoTableHookData {
  pageNumber: number;
}

// Tipo para os técnicos
type Technician = Pick<User, 'id' | 'name'>;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  statuses: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  statuses,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados da Tabela
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const [sorting, setSorting] = useState<SortingState>([
    { id: sort, desc: order === 'desc' },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
    manualSorting: true,
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater;

      setSorting(newSorting);

      const params = new URLSearchParams(searchParams.toString());
      if (newSorting.length > 0) {
        params.set('sort', newSorting[0].id);
        params.set('order', newSorting[0].desc ? 'desc' : 'asc');
      } else {
        params.set('sort', 'createdAt');
        params.set('order', 'desc');
      }
      router.push(pathname + '?' + params.toString());
    },
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
    getRowId: (row) => (row as TicketComRelacoes).id,
  });

  // Buscar Técnicos
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
  }, []);

  // Variáveis derivadas
  const numSelected = table.getSelectedRowModel().rows.length;
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row) => (row.original as TicketComRelacoes).id,
  );

  // Handle Bulk Update
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
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
      setStatusToAction('');
      setTechnicianToAction('');
    }
  };

  // Handle Delete
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
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
      setIsDeleteAlertOpen(false);
    }
  };

  // Handle Export Excel/CSV - ADAPTADO PARA ticketId
  const handleExportExcelCsv = async (format: 'xlsx' | 'csv') => {
    if (numSelected === 0) {
      toast.error('Nenhum ticket selecionado para exportar.');
      return;
    }

    toast.info(`A gerar o ficheiro ${format.toUpperCase()}...`, {
      id: 'export-toast',
    });
    setIsLoading(true);

    const dataToExport = selectedRows.map((row) => {
      const ticket = row.original as TicketComRelacoes;
      return {
        'ID do Ticket':
          ticket.ticketId || `#${ticket.id.substring(ticket.id.length - 6)}`, // USA ticketId
        Título: ticket.title,
        Departamento: ticket.area.name,
        Prioridade: ticket.priority,
        Status: ticket.status,
        'Atribuído a': ticket.technician ? ticket.technician.name : 'N/A',
        Solicitante: ticket.requester.name,
        'Criado em': new Date(ticket.createdAt),
        'Resolvido em': ticket.resolvedAt ? new Date(ticket.resolvedAt) : null,
        Avaliação: ticket.satisfactionRating || null,
      };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Chamados');

    worksheet.columns = Object.keys(dataToExport[0]).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));

    worksheet.getColumn('Criado em').numFmt = 'dd/mm/yyyy hh:mm';
    worksheet.getColumn('Resolvido em').numFmt = 'dd/mm/yyyy hh:mm';
    worksheet.addRows(dataToExport);

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
        buffer = await workbook.csv.writeBuffer();
        fileType = 'text/csv;charset=utf-8;';
        fileName = 'chamados_exportados.csv';
      }

      const blob = new Blob([buffer], { type: fileType });
      saveAs(blob, fileName);

      toast.success('Exportação concluída!', { id: 'export-toast' });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao gerar o ficheiro.', { id: 'export-toast' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Export PDF - ADAPTADO PARA ticketId
  const handleExportPdf = () => {
    if (numSelected === 0) {
      toast.error('Nenhum ticket selecionado para exportar.');
      return;
    }

    toast.info('A gerar PDF...', { id: 'export-toast' });
    setIsLoading(true);

    try {
      const head = [
        [
          'ID',
          'Título',
          'Status',
          'Prioridade',
          'Atribuído a',
          'Criado em',
          'Resolvido em',
        ],
      ];
      const body = selectedRows.map((row) => {
        const ticket = row.original as TicketComRelacoes;
        return [
          ticket.ticketId || `#${ticket.id.substring(ticket.id.length - 6)}`, // USA ticketId
          ticket.title,
          ticket.status,
          ticket.priority,
          ticket.technician ? ticket.technician.name : 'N/A',
          new Date(ticket.createdAt).toLocaleDateString('pt-BR'),
          ticket.resolvedAt
            ? new Date(ticket.resolvedAt).toLocaleDateString('pt-BR')
            : 'N/A',
        ];
      });

      const doc = new jsPDF();

      // Cabeçalho do PDF
      const logoBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABCSURBVFhH7c4xEQAgDMCw/HN8G7aBIAiCERBERAgiIAhBRISIIARBRISIIARBRISIIARBRIRIJPkH6eYADi6r/wAAAABJRU5ErkJggg==';
      doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Chamados', 40, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('Exportação do Sistema de Chamados Internos', 40, 24);
      doc.text(
        `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        doc.internal.pageSize.getWidth() - 14,
        18,
        { align: 'right' },
      );

      // Tabela do PDF
      autoTable(doc, {
        startY: 35,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 30, 30],
          textColor: [255, 255, 255],
        },
        didDrawPage: (data: UserOptions | AutoTableHookData) => {
          const hookData = data as AutoTableHookData;
          const pageCount = (doc.internal as any).getNumberOfPages();
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(
            `Página ${hookData.pageNumber} de ${pageCount}`,
            14,
            doc.internal.pageSize.getHeight() - 10,
          );
          doc.text(
            `Relatório de Chamados | ${new Date().toLocaleDateString('pt-BR')}`,
            doc.internal.pageSize.getWidth() - 14,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'right' },
          );
        },
      });

      doc.save('chamados_exportados.pdf');
      toast.success('PDF gerado com sucesso!', { id: 'export-toast' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o PDF.', { id: 'export-toast' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* TOOLBAR DE AÇÕES EM LOTE */}
        <div
          className={cn(
            'space-y-4 rounded-lg border p-4',
            numSelected > 0 ? 'bg-muted/50' : 'hidden',
          )}
        >
          {/* Linha 1: Contagem e Ações Finais */}
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
                  <DropdownMenuItem
                    onClick={() => handleExportExcelCsv('xlsx')}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportExcelCsv('csv')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
                    CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf}>
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-red-600" />
                    PDF (.pdf)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botão de Excluir */}
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

          {/* Linha 2: Ações de Atualização */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {/* Atualizar Status */}
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

            {/* Atribuir Usuário */}
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

        {/* Tabela */}
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
