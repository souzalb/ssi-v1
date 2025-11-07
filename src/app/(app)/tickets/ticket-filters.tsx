'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { formatISO } from 'date-fns';

// Componentes
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
import { X, Search, Filter } from 'lucide-react';
import { useDebounce } from '../../../../hooks/use-debounce';
import { DatePicker } from '@/app/_components/date-picker';

// Labels traduzidas para Status
const statusLabels: Record<string, string> = {
  OPEN: 'Aberto',
  ASSIGNED: 'Atribuído',
  IN_PROGRESS: 'Em Andamento',
  ON_HOLD: 'Em Espera',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
  CANCELLED: 'Cancelado',
};

// Labels traduzidas para Prioridade
const priorityLabels: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

interface TicketFiltersProps {
  statuses: string[];
  priorities: string[];
  technicians: { id: string; name: string }[];
}

export function TicketFilters({
  statuses,
  priorities,
  technicians,
}: TicketFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados para os filtros
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

  // Debounce para otimização
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Valores atuais dos filtros
  const currentStatus = searchParams.get('status') || 'all';
  const currentPriority = searchParams.get('priority') || 'all';
  const currentTechnician = searchParams.get('technician') || 'all';

  // Função auxiliar para criar query string
  const createQueryString = useCallback(
    (params: URLSearchParams, name: string, value: string) => {
      if (value === 'all' || value === '') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.set('page', '1'); // Reseta a página
      return params;
    },
    [],
  );

  // Handler para os Selects
  const handleSelectFilterChange = (
    name: 'status' | 'priority' | 'technician',
    value: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    const queryString = createQueryString(params, name, value).toString();
    router.push(pathname + '?' + queryString);
  };

  // Efeito para pesquisa debounced
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

  // Efeito para os seletores de data
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

  // Função para limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    router.push(pathname);
  };

  // Verificação de filtros ativos
  const isFiltered =
    searchParams.has('search') ||
    searchParams.has('status') ||
    searchParams.has('priority') ||
    searchParams.has('startDate') ||
    searchParams.has('endDate') ||
    searchParams.has('technician');

  // Contagem de filtros ativos
  const activeFiltersCount = [
    searchParams.has('search'),
    searchParams.has('status') && currentStatus !== 'all',
    searchParams.has('priority') && currentPriority !== 'all',
    searchParams.has('technician') && currentTechnician !== 'all',
    searchParams.has('startDate'),
    searchParams.has('endDate'),
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Linha 1: Pesquisa e Botão Limpar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Pesquisar por ID do ticket (ex: TK-TI-0001), título ou equipamento..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isFiltered && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full px-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Linha 2: Filtros Avançados */}
      <div className="bg-card rounded-lg border p-4">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <h3 className="text-foreground text-sm font-semibold">
            Filtros Avançados
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {/* Filtro Status */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Status</Label>
            <Select
              value={currentStatus}
              onValueChange={(value) =>
                handleSelectFilterChange('status', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s] || s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Prioridade */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Prioridade</Label>
            <Select
              value={currentPriority}
              onValueChange={(value) =>
                handleSelectFilterChange('priority', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                {priorities.map((p) => (
                  <SelectItem key={p} value={p}>
                    {priorityLabels[p] || p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Técnico */}
          {technicians.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Técnico Atribuído</Label>
              <Select
                value={currentTechnician}
                onValueChange={(value) =>
                  handleSelectFilterChange('technician', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Técnicos</SelectItem>
                  <SelectItem value="unassigned">Não Atribuídos</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro Data Inicial */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Data Inicial</Label>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              placeholder="Selecione a data"
            />
          </div>

          {/* Filtro Data Final */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Data Final</Label>
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              placeholder="Selecione a data"
            />
          </div>
        </div>
      </div>

      {/* Badges de Filtros Ativos */}
      {isFiltered && (
        <div className="flex flex-wrap gap-2">
          {searchParams.get('search') && (
            <Badge variant="secondary" className="gap-1">
              Busca: {searchParams.get('search')}
              <button
                onClick={() => {
                  setSearchTerm('');
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('search');
                  params.set('page', '1');
                  router.push(pathname + '?' + params.toString());
                }}
                className="hover:bg-secondary-foreground/20 ml-1 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusLabels[currentStatus] || currentStatus}
              <button
                onClick={() => handleSelectFilterChange('status', 'all')}
                className="hover:bg-secondary-foreground/20 ml-1 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentPriority !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Prioridade: {priorityLabels[currentPriority] || currentPriority}
              <button
                onClick={() => handleSelectFilterChange('priority', 'all')}
                className="hover:bg-secondary-foreground/20 ml-1 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentTechnician !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Técnico:{' '}
              {currentTechnician === 'unassigned'
                ? 'Não Atribuídos'
                : technicians.find((t) => t.id === currentTechnician)?.name ||
                  currentTechnician}
              <button
                onClick={() => handleSelectFilterChange('technician', 'all')}
                className="hover:bg-secondary-foreground/20 ml-1 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {startDate && (
            <Badge variant="secondary" className="gap-1">
              De: {formatISO(startDate, { representation: 'date' })}
              <button
                onClick={() => setStartDate(undefined)}
                className="hover:bg-secondary-foreground/20 ml-1 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {endDate && (
            <Badge variant="secondary" className="gap-1">
              Até: {formatISO(endDate, { representation: 'date' })}
              <button
                onClick={() => setEndDate(undefined)}
                className="hover:bg-secondary-foreground/20 ml-1 rounded-full"
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
