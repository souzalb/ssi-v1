'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { formatISO } from 'date-fns';

// --- Componentes ---
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
import { X } from 'lucide-react';
import { useDebounce } from '../../../../hooks/use-debounce';
import { DatePicker } from '@/app/_components/date-picker';

// Props que este componente recebe (incluindo técnicos)
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

  // --- Estados para os filtros ---
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

  // Otimização: Debounce para o campo de pesquisa
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Valores atuais dos Selects (lidos da URL)
  const currentStatus = searchParams.get('status') || 'all';
  const currentPriority = searchParams.get('priority') || 'all';
  const currentTechnician = searchParams.get('technician') || 'all';

  // --- Lógica de Atualização da URL ---

  // Função auxiliar para criar a query string
  const createQueryString = useCallback(
    (params: URLSearchParams, name: string, value: string) => {
      if (value === 'all' || value === '') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.set('page', '1'); // Reseta a página em qualquer filtro
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

  // Efeito para a pesquisa "debounced"
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

  // Função para Limpar Filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    router.push(pathname); // Limpa todos os parâmetros da URL
  };

  // Verificação se há filtros ativos
  const isFiltered =
    searchParams.has('search') ||
    searchParams.has('status') ||
    searchParams.has('priority') ||
    searchParams.has('startDate') ||
    searchParams.has('endDate') ||
    searchParams.has('technician');

  return (
    <div className="space-y-4">
      {/* --- Linha 1: Pesquisa e Botão Limpar --- */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Pesquisar por ID, título, equipamento (digite para filtrar...)"
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* --- Linha 2: Filtros de Dropdown (Status, Prioridade, Datas) --- */}
      <div className="bg-card grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-3 lg:grid-cols-5">
        {/* Filtro Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={currentStatus}
            onValueChange={(value) => handleSelectFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro Prioridade */}
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select
            value={currentPriority}
            onValueChange={(value) =>
              handleSelectFilterChange('priority', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por prioridade..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              {priorities.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Técnico (Condicional) */}
        {technicians.length > 0 && (
          <div className="space-y-2">
            <Label>Técnico</Label>
            <Select
              value={currentTechnician}
              onValueChange={(value) =>
                handleSelectFilterChange('technician', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por técnico..." />
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
          <Label>Data Inicial</Label>
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            placeholder="Selecione a data inicial"
          />
        </div>

        {/* Filtro Data Final */}
        <div className="space-y-2">
          <Label>Data Final</Label>
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            placeholder="Selecione a data final"
          />
        </div>
      </div>
    </div>
  );
}
