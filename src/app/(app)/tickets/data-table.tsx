'use client';
/* eslint-disable */
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
  getPaginationRowModel,
} from '@tanstack/react-table';
import { User } from '@prisma/client';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable, { type UserOptions } from 'jspdf-autotable';

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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/app/_components/ui/dropdown-menu';
import {
  Trash,
  Download,
  Loader2,
  FileSpreadsheet,
  CheckSquare,
  UserPlus,
  RefreshCw,
  FileText,
  Sheet,
  FileDown,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { TicketComRelacoes } from './columns';
import { cn } from '@/app/_lib/utils';

interface AutoTableHookData {
  pageNumber: number;
}

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

  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const [sorting, setSorting] = useState<SortingState>([
    { id: sort, desc: order === 'desc' },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [statusToAction, setStatusToAction] = useState<string>('');
  const [technicianToAction, setTechnicianToAction] = useState<string>('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    onPaginationChange: setPagination,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    getRowId: (row) => (row as TicketComRelacoes).id,
  });

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

  const numSelected = table.getSelectedRowModel().rows.length;
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row) => (row.original as TicketComRelacoes).id,
  );

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
          ticket.ticketId || `#${ticket.id.substring(ticket.id.length - 6)}`,
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
          ticket.ticketId || `#${ticket.id.substring(ticket.id.length - 6)}`,
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

      const logoBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABCSURBVFhH7c4xEQAgDMCw/HN8G7aBIAiCERBERAgiIAhBRISIIARBRISIIARBRIRIJPkH6eYADi6r/wAAAABJRU5ErkJggg==';
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
    <Card className="border-0 bg-white p-4 shadow-xl sm:p-6 dark:bg-slate-900">
      <CardContent className="space-y-4 p-0">
        {/* TOOLBAR DE AÇÕES EM LOTE */}
        <div
          className={cn(
            'animate-in slide-in-from-top-2 relative overflow-hidden rounded-xl border border-dashed p-4 transition-all duration-300 sm:p-6',
            numSelected > 0
              ? 'border-blue-300 bg-linear-to-br from-blue-50 to-indigo-50 dark:border-blue-700 dark:from-blue-950/30 dark:to-indigo-950/30'
              : 'hidden',
          )}
        >
          {/* Gradient decorativo */}
          {numSelected > 0 && (
            <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-indigo-500" />
          )}

          <div className="space-y-4">
            {/* Header com contador */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 md:text-lg dark:text-white">
                      {numSelected} selecionado{numSelected !== 1 ? 's' : ''}
                    </span>
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Aplicar ações em lote aos tickets selecionados
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Dropdown de Exportar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="border-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      <Download className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Exportar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs font-semibold">
                      Escolha o formato
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleExportExcelCsv('xlsx')}
                      className="cursor-pointer"
                    >
                      <Sheet className="mr-2 h-4 w-4 text-emerald-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">Excel</span>
                        <span className="text-muted-foreground text-xs">
                          .xlsx
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExportExcelCsv('csv')}
                      className="cursor-pointer"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">CSV</span>
                        <span className="text-muted-foreground text-xs">
                          .csv
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportPdf}
                      className="cursor-pointer"
                    >
                      <FileText className="mr-2 h-4 w-4 text-red-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">PDF</span>
                        <span className="text-muted-foreground text-xs">
                          .pdf
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Botão de Excluir */}
                <AlertDialog
                  open={isDeleteAlertOpen}
                  onOpenChange={setIsDeleteAlertOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isLoading}
                      className="border-2 border-red-300 dark:border-red-800"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                      ) : (
                        <Trash className="h-4 w-4 sm:mr-2" />
                      )}
                      <span className="hidden sm:inline">Excluir</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-100 p-2 dark:bg-red-950/30">
                          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <AlertDialogTitle>
                          Tem a certeza absoluta?
                        </AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="pt-2">
                        Esta ação não pode ser desfeita.{' '}
                        <strong>{numSelected} chamado(s)</strong> serão
                        permanentemente excluídos da base de dados.
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

            {/* Ações de Atualização */}
            <div className="grid grid-cols-1 gap-4 rounded-lg border-2 border-slate-200 bg-white p-4 lg:grid-cols-2 dark:border-slate-700 dark:bg-slate-900">
              {/* Atualizar Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-semibold">
                  <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                  Atualizar Status
                </Label>
                <div className="flex flex-col gap-2 md:flex-row">
                  <Select
                    value={statusToAction}
                    onValueChange={setStatusToAction}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
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
                    className="shrink-0 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>

              {/* Atribuir Usuário */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-semibold">
                  <UserPlus className="h-3.5 w-3.5 text-purple-600" />
                  Atribuir Técnico
                </Label>
                <div className="flex flex-col gap-2 md:flex-row">
                  <Select
                    value={technicianToAction}
                    onValueChange={setTechnicianToAction}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full border-2 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                      <SelectValue placeholder="Selecionar técnico..." />
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
                    className="shrink-0 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Atribuir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-lg border-2 border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-slate-50 dark:bg-slate-900"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-semibold">
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
                table.getRowModel().rows.map((row) => {
                  // Obter os dados da linha (necessário para o ID)
                  const ticket = row.original as TicketComRelacoes;

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => {
                        // Navega para a página de detalhes do ticket
                        router.push(`/tickets/${ticket.id}`);
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        // VERIFICAR SE A CÉLULA É INTERATIVA
                        const isInteractiveCell =
                          cell.column.id === 'select' || // O Checkbox
                          cell.column.id === 'actions' || // O Menu Dropdown
                          cell.column.id === 'ticketId'; // O Link do ID

                        return (
                          <TableCell
                            key={cell.id}
                            // 'stopPropagation'
                            onClick={
                              isInteractiveCell
                                ? (e) => e.stopPropagation()
                                : undefined
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <FileDown className="h-8 w-8" />
                      <p className="text-sm font-medium">
                        Nenhum resultado encontrado.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação Moderna */}
        <div className="flex flex-col gap-4 rounded-lg border-2 border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
          {/* Info e Seletor de Linhas */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="rows-per-page"
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Linhas por página:
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger
                  id="rows-per-page"
                  className="h-8 w-[70px] border-2"
                >
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Mostrando{' '}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{' '}
              a{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{' '}
              de {table.getFilteredRowModel().rows.length} resultados
            </div>
          </div>

          {/* Controles de Navegação */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Página
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-blue-500 bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                de {table.getPageCount()}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
