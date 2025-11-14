'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { formatISO } from 'date-fns';
import { AreaName } from '@prisma/client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';
import { Label } from '@/app/_components/ui/label';
import { Input } from '@/app/_components/ui/input';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import {
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useDebounce } from '../../../../hooks/use-debounce'; // (Ajuste o caminho se necessário)
import { DatePicker } from '@/app/_components/date-picker'; // (Ajuste o caminho)
import { cn } from '@/app/_lib/utils'; // (Ajuste o caminho)

// --- Mapas de Labels e Cores (sem alteração) ---
const statusLabels: Record<string, string> = {
  OPEN: 'Aberto',
  ASSIGNED: 'Atribuído',
  IN_PROGRESS: 'Em Andamento',
  ON_HOLD: 'Em Espera',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
  CANCELLED: 'Cancelado',
};
const priorityLabels: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};
const areaColors: Record<AreaName, string> = {
  TI: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  BUILDING:
    'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800',
  ELECTRICAL:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
};
const areaLabels: Record<AreaName, string> = {
  TI: 'T.I.',
  BUILDING: 'Predial',
  ELECTRICAL: 'Elétrica',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  ASSIGNED:
    'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  IN_PROGRESS:
    'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  ON_HOLD: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  RESOLVED:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  CLOSED:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};
const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  MEDIUM:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-500',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-500',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-500',
};
// --- Fim dos Mapas ---

interface TicketFiltersProps {
  statuses: string[];
  priorities: string[];
  technicians: { id: string; name: string }[];
  areas: { id: string; name: AreaName }[];
  isSuperAdmin: boolean;
}

export function TicketFilters({
  statuses,
  priorities,
  technicians,
  areas,
  isSuperAdmin,
}: TicketFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- 1. ESTADOS DE FILTRO (APENAS OS NECESSÁRIOS) ---
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined,
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || '',
  );
  // (Os estados 'statusFilter', 'priorityFilter', etc. foram REMOVIDOS)

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- 2. LEITURA DA "FONTE DA VERDADE" (URL) ---
  const currentStatus = searchParams.get('status') || 'all';
  const currentPriority = searchParams.get('priority') || 'all';
  const currentTechnician = searchParams.get('technician') || 'all';
  const currentArea = searchParams.get('area') || 'all';
  const currentSearch = searchParams.get('search');
  const currentStartDate = searchParams.get('startDate');
  const currentEndDate = searchParams.get('endDate');

  const selectedArea = areas.find((a) => a.id === currentArea);

  // --- 3. CONTAGEM DE FILTROS (CORRIGIDA) ---
  const activeFiltersCount = [
    !!currentSearch, // Verdadeiro se a string não for nula ou vazia
    currentStatus !== 'all',
    currentPriority !== 'all',
    currentTechnician !== 'all',
    currentArea !== 'all',
    !!currentStartDate,
    !!currentEndDate,
  ].filter(Boolean).length;

  const isFiltered = activeFiltersCount > 0;

  // --- 4. LÓGICA DE ESTADO DERIVADO (CORRIGIDA) ---
  // (Resolve o erro 'set-state-in-effect' do ESLint)
  const [manuallyExpanded, setManuallyExpanded] = useState<boolean | undefined>(
    undefined,
  );
  const showAdvancedFilters =
    manuallyExpanded === true || (manuallyExpanded === undefined && isFiltered);

  // (O useEffect problemático foi removido)

  // --- 5. HANDLERS (Unificados) ---
  const createQueryString = useCallback(
    (params: URLSearchParams, name: string, value: string) => {
      if (value === 'all' || value === '') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.set('page', '1');
      return params;
    },
    [],
  );

  const handleSelectFilterChange = (
    name: 'status' | 'priority' | 'technician' | 'area',
    value: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    const queryString = createQueryString(params, name, value).toString();
    router.push(pathname + '?' + queryString);
  };

  useEffect(() => {
    if (debouncedSearchTerm !== (searchParams.get('search') || '')) {
      const params = new URLSearchParams(searchParams.toString());
      const queryString = createQueryString(
        params,
        'search',
        debouncedSearchTerm,
      ).toString();
      router.push(pathname + '?' + queryString);
    }
  }, [debouncedSearchTerm, searchParams, pathname, router, createQueryString]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    const startDateISO = startDate
      ? formatISO(startDate, { representation: 'date' })
      : null;
    const endDateISO = endDate
      ? formatISO(endDate, { representation: 'date' })
      : null;

    if (startDateISO !== searchParams.get('startDate')) {
      changed = true;
      if (startDateISO) params.set('startDate', startDateISO);
      else params.delete('startDate');
    }
    if (endDateISO !== searchParams.get('endDate')) {
      changed = true;
      if (endDateISO) params.set('endDate', endDateISO);
      else params.delete('endDate');
    }

    if (changed) {
      params.set('page', '1');
      router.push(pathname + '?' + params.toString());
    }
  }, [startDate, endDate, searchParams, pathname, router]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    setManuallyExpanded(false); // Fecha o menu
    router.push(pathname);
  }, [pathname, router]);

  const toggleAdvancedFilters = () => {
    setManuallyExpanded(!showAdvancedFilters);
  };

  return (
    <div className="space-y-4">
      {/* Card Principal de Busca e Controles */}
      <div className="relative overflow-hidden rounded-xl border-0 bg-white p-4 shadow-xl sm:p-6 dark:bg-slate-900">
        {/* Gradient decorativo */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-emerald-500" />

        <div className="space-y-4">
          {/* Header com título e contador */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                <Search className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Pesquisar Chamados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Encontre e filtre seus tickets
                </p>
              </div>
            </div>

            {/* --- 6. BADGE DE CONTAGEM CORRIGIDO --- */}
            {/* Agora lê o 'activeFiltersCount' correto */}
            {isFiltered && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {activeFiltersCount} filtro
                  {activeFiltersCount !== 1 ? 's' : ''} ativo
                  {activeFiltersCount !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 gap-1 text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  <X className="h-3 w-3" />
                  Limpar tudo
                </Button>
              </div>
            )}
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Pesquisar por ID (ex: TI-1001), título ou equipamento..."
              className="h-12 border-2 pr-4 pl-11 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Botão Toggle Filtros Avançados */}
          <Button
            variant="outline"
            onClick={toggleAdvancedFilters}
            className="w-full justify-between border-2 border-dashed hover:border-solid hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-semibold">Filtros Avançados</span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="outline"
                  className="ml-1 rounded-full bg-blue-600 px-2 text-white"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {/* Agora lê o 'showAdvancedFilters' derivado */}
            {showAdvancedFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Filtros Avançados (Colapsáveis) */}
          {showAdvancedFilters && (
            <div className="animate-in slide-in-from-top-2 space-y-4 rounded-lg border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                {/* Filtro Status (lê 'currentStatus' da URL) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                    Status
                  </Label>
                  <Select
                    value={currentStatus}
                    onValueChange={(value) =>
                      handleSelectFilterChange('status', value)
                    }
                  >
                    <SelectTrigger className="w-full border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent className="">
                      <SelectItem value="all">Todos os Status</SelectItem>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${statusColors[s]?.split(' ')[0].replace('bg-', 'bg-')}`}
                            />
                            {statusLabels[s] || s}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro Prioridade (lê 'currentPriority' da URL) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    Prioridade
                  </Label>
                  <Select
                    value={currentPriority}
                    onValueChange={(value) =>
                      handleSelectFilterChange('priority', value)
                    }
                  >
                    <SelectTrigger className="w-full border-2 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                      <SelectValue placeholder="Todas as prioridades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Prioridades</SelectItem>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${priorityColors[p]?.split(' ')[0].replace('bg-', 'bg-')}`}
                            />
                            {priorityLabels[p] || p}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro Técnico (lê 'currentTechnician' da URL) */}
                {technicians.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold">
                      <Users className="h-3.5 w-3.5 text-purple-600" />
                      Técnico
                    </Label>
                    <Select
                      value={currentTechnician}
                      onValueChange={(value) =>
                        handleSelectFilterChange('technician', value)
                      }
                    >
                      <SelectTrigger className="w-full border-2 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                        <SelectValue placeholder="Todos os técnicos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Técnicos</SelectItem>
                        <SelectItem value="unassigned">
                          Não Atribuídos
                        </SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Filtro Área (lê 'currentArea' da URL) */}
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold">
                      <Building className="h-3.5 w-3.5 text-lime-600" />
                      Área
                    </Label>
                    <Select
                      value={currentArea}
                      onValueChange={(value) =>
                        handleSelectFilterChange('area', value)
                      }
                    >
                      <SelectTrigger className="w-full border-2 transition-all focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20">
                        <SelectValue placeholder="Todos os Depart." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Depart.</SelectItem>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${areaColors[area.name]?.split(' ')[0].replace('bg-', 'bg-')}`}
                              />
                              {areaLabels[area.name] || area.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Filtro Data Inicial */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    Data Inicial
                  </Label>
                  <DatePicker
                    date={startDate}
                    setDate={setStartDate}
                    placeholder="Selecione a data"
                  />
                </div>

                {/* Filtro Data Final */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    Data Final
                  </Label>
                  <DatePicker
                    date={endDate}
                    setDate={setEndDate}
                    placeholder="Selecione a data"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges de Filtros Ativos (sem alteração, mas agora usa 'activeFiltersCount' correto) */}
      {isFiltered && (
        <div className="flex flex-wrap gap-2">
          {/* Badge de Search (agora lê 'currentSearch') */}
          {currentSearch && (
            <Badge
              variant="secondary"
              className="group gap-2 border-blue-200 bg-blue-50 pr-1 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
            >
              <Search className="h-3 w-3" />
              <span className="max-w-[200px] truncate">{currentSearch}</span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('search');
                  params.set('page', '1');
                  router.push(pathname + '?' + params.toString());
                }}
                className="rounded-full p-1 transition-colors hover:bg-blue-200 dark:hover:bg-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Badge de Status */}
          {currentStatus !== 'all' && (
            <Badge
              className={`group gap-2 border-0 pr-1 ${statusColors[currentStatus]}`}
            >
              <CheckCircle2 className="h-3 w-3" />
              {statusLabels[currentStatus] || currentStatus}
              <button
                onClick={() => handleSelectFilterChange('status', 'all')}
                className="rounded-full p-1 transition-colors hover:bg-black/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentPriority !== 'all' && (
            <Badge
              className={`group gap-2 border-0 pr-1 ${priorityColors[currentPriority]}`}
            >
              <AlertCircle className="h-3 w-3" />
              {priorityLabels[currentPriority] || currentPriority}
              <button
                onClick={() => handleSelectFilterChange('priority', 'all')}
                className="rounded-full p-1 transition-colors hover:bg-black/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentTechnician !== 'all' && (
            <Badge
              variant="secondary"
              className="group gap-2 border-purple-200 bg-purple-50 pr-1 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400"
            >
              <Users className="h-3 w-3" />
              {currentTechnician === 'unassigned'
                ? 'Não Atribuídos'
                : technicians.find((t) => t.id === currentTechnician)?.name ||
                  currentTechnician}
              <button
                onClick={() => handleSelectFilterChange('technician', 'all')}
                className="rounded-full p-1 transition-colors hover:bg-purple-200 dark:hover:bg-purple-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {isSuperAdmin && currentArea !== 'all' && selectedArea && (
            <Badge
              // CORREÇÃO: Usar selectedArea.name para encontrar a cor
              className={cn(
                'group gap-2 border-0 pr-1',
                areaColors[selectedArea.name] || 'bg-slate-100',
              )}
            >
              <Building className="h-3 w-3" />
              {/* CORREÇÃO: Usar selectedArea.name para a tradução */}
              {areaLabels[selectedArea.name] || selectedArea.name}
              <button
                onClick={() => handleSelectFilterChange('area', 'all')}
                className="rounded-full p-1 transition-colors hover:bg-black/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {startDate && (
            <Badge
              variant="secondary"
              className="group gap-2 border-emerald-200 bg-emerald-50 pr-1 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              <Calendar className="h-3 w-3" />
              De: {formatISO(startDate, { representation: 'date' })}
              <button
                onClick={() => setStartDate(undefined)}
                className="rounded-full p-1 transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {endDate && (
            <Badge
              variant="secondary"
              className="group gap-2 border-emerald-200 bg-emerald-50 pr-1 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              <Calendar className="h-3 w-3" />
              Até: {formatISO(endDate, { representation: 'date' })}
              <button
                onClick={() => setEndDate(undefined)}
                className="rounded-full p-1 transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
