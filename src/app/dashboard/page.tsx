'use client';

import { TicketComIncludes } from '@/app/types';
import React from 'react';
import useSWR, { Fetcher } from 'swr';

type Status = TicketComIncludes['status'];

// Helper para formatar a data
const formatarData = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Componente para exibir o Status com cor
// Usamos nosso tipo 'Status' local derivado
const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  // O tipo 'Status' (ex: "OPEN" | "ASSIGNED" | ...)
  // ainda funciona perfeitamente como chave para o Record.
  const statusMap: Record<Status, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    ASSIGNED: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
    CLOSED: 'bg-green-100 text-green-800', // Mapeado de RESOLVED
    CANCELLED: 'bg-red-100 text-red-800',
  };
  const statusText: Record<Status, string> = {
    OPEN: 'Aberto',
    ASSIGNED: 'Atribuído',
    IN_PROGRESS: 'Em Progresso',
    CLOSED: 'Fechado',
    CANCELLED: 'Cancelado',
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        statusMap[status] || 'bg-gray-100'
      }`}
    >
      {statusText[status] || status}
    </span>
  );
};

// Componente Card do Chamado (Ticket)
const TicketCard: React.FC<{ ticket: TicketComIncludes }> = ({ ticket }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="mb-4 text-sm text-gray-600">{ticket.description}</p>

      <div className="border-t border-gray-100 pt-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="block text-gray-500">Solicitante:</span>
            <span className="font-medium text-gray-900">
              {ticket.requester?.name || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-gray-500">Técnico:</span>
            <span className="font-medium text-gray-900">
              {ticket.technician?.name || 'Não atribuído'}
            </span>
          </div>
          <div>
            <span className="block text-gray-500">Área:</span>
            <span className="font-medium text-gray-900">
              {ticket.area?.name || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-gray-500">Aberto em:</span>
            <span className="font-medium text-gray-900">
              {formatarData(ticket.createdAt.toString())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Página Principal do Dashboard ---

// O 'fetcher' é uma função que o SWR usa para buscar os dados.
// Ele espera que nossa API retorne os dados como JSON.
const fetcher: Fetcher<TicketComIncludes[], string> = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error('Falha ao buscar dados da API');
    }
    return res.json();
  });

// No App Router, a exportação padrão é o componente
export default function DashboardPage() {
  // 1. O HOOK SWR
  // Ele chama '/api/tickets' usando nosso 'fetcher'
  const {
    data: tickets,
    error,
    isLoading,
  } = useSWR('/api/tickets', fetcher, {
    refreshInterval: 30000, // Atualiza os dados a cada 30 segundos
  });

  // 2. Estado de Carregamento (Loading)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-700">
          Carregando chamados...
        </div>
      </div>
    );
  }

  // 3. Estado de Erro
  if (error || !tickets) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-red-600">
          Erro ao carregar chamados: {error?.message || 'Dados não encontrados'}
        </div>
      </div>
    );
  }

  // 4. Estado de Sucesso (Dados Carregados)

  // Como nosso auth.ts simula um GESTOR, esta tela mostrará
  // a visão do Gestor.
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Painel do Gestor (TI)
        </h1>
        <p className="text-gray-600">Chamados abertos para sua área.</p>
      </header>

      {/* Seção de Fila (Ex: Não Atribuídos) */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Fila (Não Atribuídos)
        </h2>

        {/* Filtramos os tickets 'OPEN' (Abertos) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets
            .filter((t) => t.status === 'OPEN')
            .map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
        </div>

        {/* Mensagem se a fila estiver vazia */}
        {tickets.filter((t) => t.status === 'OPEN').length === 0 && (
          <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
            Nenhum chamado &ldquo;Aberto&rdquo; na fila.
          </div>
        )}
      </section>

      {/* Seção de Chamados em Andamento */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Chamados em Andamento
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets
            .filter((t) => t.status !== 'OPEN' && t.status !== 'CLOSED')
            .map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
        </div>

        {/* Mensagem se não houver chamados em andamento */}
        {tickets.filter((t) => t.status !== 'OPEN' && t.status !== 'CLOSED')
          .length === 0 && (
          <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
            Nenhum chamado em andamento.
          </div>
        )}
      </section>
    </div>
  );
}
