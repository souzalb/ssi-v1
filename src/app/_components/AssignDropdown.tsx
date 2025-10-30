'use client';

import { User } from '@prisma/client';
import React, { useState, useTransition } from 'react';
// Importar o 'mutate' (ou useSWRConfig) para revalidar os dados
import { useSWRConfig } from 'swr';

type AssignDropdownProps = {
  ticketId: string;
  technicians: User[]; // A lista de técnicos da área
};

export default function AssignDropdown({
  ticketId,
  technicians,
}: AssignDropdownProps) {
  const { mutate } = useSWRConfig();

  // Estado 1: Qual técnico está selecionado no <select>
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  // Estado 2: Para feedback da API
  const [error, setError] = useState<string | null>(null);
  // useTransition para feedback de "carregando" sem bloquear a UI
  const [isPending, startTransition] = useTransition();

  const handleAssign = async () => {
    if (!selectedTechId) {
      setError('Por favor, selecione um técnico.');
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            technicianId: selectedTechId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Falha ao atribuir');
        }

        // SUCESSO!
        // Informa ao SWR (na página principal) que os dados de '/api/tickets'
        // estão "velhos" e precisam ser buscados novamente.
        // Isso fará o chamado atualizar seu status de "Aberto" para "Atribuído".
        mutate('/api/tickets');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <select
          value={selectedTechId}
          onChange={(e) => setSelectedTechId(e.target.value)}
          className="flex rounded-md border border-gray-300 p-2 shadow-sm"
          disabled={isPending}
        >
          <option value="" disabled>
            Selecione um técnico...
          </option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAssign}
          disabled={isPending || !selectedTechId}
          className="rounded-md bg-blue-600 px-4 py-2 font-bold text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending ? '...' : 'Atribuir'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
