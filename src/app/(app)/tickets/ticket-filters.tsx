'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react'; // <-- Importe useEffect

// Componentes Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';
import { Label } from '@/app/_components/ui/label';
import { Input } from '@/app/_components/ui/input';
import { useDebounce } from '../../../../hooks/use-debounce';
import { Button } from '@/app/_components/ui/button';
import { X } from 'lucide-react';
// (Button e Search não são mais necessários aqui)

// Props (as mesmas)
interface TicketFiltersProps {
  statuses: string[];
  priorities: string[];
}

export function TicketFilters({ statuses, priorities }: TicketFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- LÓGICA DE PESQUISA ATUALIZADA ---

  // 1. Estado "imediato" do campo de input
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || '',
  );

  // 2. Estado "debounced" (só atualiza 500ms após o utilizador parar de digitar)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Pega os valores atuais da URL (lógica existente)
  const currentStatus = searchParams.get('status') || 'all';
  const currentPriority = searchParams.get('priority') || 'all';

  // Função que cria a nova string de consulta (lógica existente)
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.set('page', '1'); // Reseta a página em qualquer filtro
      return params.toString();
    },
    [searchParams],
  );

  // --- EFEITO COLATERAL PARA ATUALIZAÇÃO AUTOMÁTICA ---

  // 3. Observa as mudanças nos filtros (Selects)
  const handleSelectFilterChange = (
    name: 'status' | 'priority',
    value: string,
  ) => {
    const queryString = createQueryString(name, value);
    router.push(pathname + '?' + queryString);
  };

  // 4. Observa a mudança no termo de pesquisa DEBOUNCED
  useEffect(() => {
    // Não executa na primeira renderização se o termo já estiver na URL
    // Apenas se o 'debouncedSearchTerm' for diferente do que está na URL
    if (debouncedSearchTerm !== (searchParams.get('search') || '')) {
      const queryString = createQueryString('search', debouncedSearchTerm);
      router.push(pathname + '?' + queryString);
    }
  }, [debouncedSearchTerm, searchParams, pathname, router, createQueryString]); // Dependências do useEffect

  const handleClearFilters = () => {
    setSearchTerm(''); // Limpa o estado local do input
    router.push(pathname); // Limpa todos os parâmetros da URL
  };

  // --- 3. VERIFICAÇÃO SE HÁ FILTROS ATIVOS ---
  const isFiltered =
    searchParams.has('search') ||
    searchParams.has('status') ||
    searchParams.has('priority');

  return (
    <div className="space-y-4">
      {/* --- Formulário de Pesquisa (agora sem <form> e <Button>) --- */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Pesquisar por ID, título, equipamento (digite para filtrar...)"
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Mostra o botão apenas se um filtro estiver ativo */}
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

      {/* --- Filtros Select --- */}
      <div className="bg-card flex gap-4 rounded-lg border p-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="status-filter">Filtrar por Status</Label>
          <Select
            value={currentStatus}
            onValueChange={(value) => handleSelectFilterChange('status', value)}
          >
            <SelectTrigger id="status-filter">
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

        <div className="flex-1 space-y-2">
          <Label htmlFor="priority-filter">Filtrar por Prioridade</Label>
          <Select
            value={currentPriority}
            onValueChange={(value) =>
              handleSelectFilterChange('priority', value)
            }
          >
            <SelectTrigger id="priority-filter">
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
      </div>
    </div>
  );
}
