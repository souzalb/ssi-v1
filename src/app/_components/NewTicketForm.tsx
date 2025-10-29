'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useSWR from 'swr';
import { Area } from '@prisma/client';

// 1. O fetcher para o SWR (buscar dados)
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 2. Definir o schema de validação (com a correção)
const ticketSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres'),

  // --- CORREÇÃO AQUI ---
  // Antes: z.string().uuid('Por favor, selecione uma área')
  // (Isso falhava para o value="" da opção placeholder)
  //
  // Agora: Separamos a checagem de "obrigatório" (min(1)) da checagem
  // de "formato" (uuid).
  areaId: z.string().min(1, 'Por favor, selecione uma área'),

  location: z.string().min(1, 'A localização é obrigatória'),
  equipment: z.string().min(1, 'O equipamento é obrigatório'),
  model: z.string().min(1, 'O modelo é obrigatório'),
  assetTag: z.string().min(1, 'O número de patrimônio é obrigatório'),
});

// 3. Inferir o tipo dos dados do formulário a partir do schema
type TicketFormData = z.infer<typeof ticketSchema>;

// --- O Componente do Formulário ---
export default function NewTicketForm() {
  // 4. Buscar as áreas da nossa nova API
  const { data: areas, error: areasError } = useSWR<Area[]>(
    '/api/areas',
    fetcher,
  );

  // 5. Hooks do react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema), // Conectar Zod ao formulário
  });

  // 6. Estado para feedback da API (sucesso ou erro)
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // 7. Função de envio (chamada pelo handleSubmit)
  const onSubmit = async (data: TicketFormData) => {
    setApiError(null);
    setApiSuccess(null);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Se a API retornar um erro (ex: 400, 500)
        throw new Error(result.error || 'Falha ao criar chamado');
      }

      // Sucesso!
      setApiSuccess('Chamado criado com sucesso! (ID: ' + result.id + ')');
      reset(); // Limpar o formulário
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setApiError(errorMessage);
    }
  };

  // --- Renderização ---

  if (areasError) {
    return (
      <div className="text-red-500">
        Erro ao carregar áreas. Tente novamente.
      </div>
    );
  }

  if (!areas) {
    return <div>Carregando formulário...</div>;
  }

  // Helper para exibir erros
  const getError = (fieldName: keyof TicketFormData) => {
    return errors[fieldName] ? (
      <span className="text-sm text-red-500">{errors[fieldName]?.message}</span>
    ) : null;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-lg space-y-4"
    >
      {/* Mensagens de Feedback da API */}
      {apiError && (
        <div className="rounded-md bg-red-100 p-3 text-red-700">{apiError}</div>
      )}
      {apiSuccess && (
        <div className="rounded-md bg-green-100 p-3 text-green-700">
          {apiSuccess}
        </div>
      )}

      {/* --- Campos do Formulário --- */}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Título
        </label>
        <input
          id="title"
          {...register('title')}
          className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm"
        />
        {getError('title')}
      </div>

      <div>
        <label
          htmlFor="areaId"
          className="block text-sm font-medium text-gray-700"
        >
          Área de Manutenção
        </label>
        <select
          id="areaId"
          {...register('areaId')}
          className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm"
          defaultValue="" // Garante que o valor inicial seja o placeholder
        >
          <option value="" disabled>
            Selecione uma área...
          </option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
        {getError('areaId')}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Descrição
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm"
        />
        {getError('description')}
      </div>

      <hr className="my-6" />

      {/* --- Campos Obrigatórios Adicionais --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Localização (ex: Sala 301)
          </label>
          <input
            id="location"
            {...register('location')}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
          {getError('location')}
        </div>
        <div>
          <label
            htmlFor="equipment"
            className="block text-sm font-medium text-gray-700"
          >
            Equipamento (ex: Ar Condicionado)
          </label>
          <input
            id="equipment"
            {...register('equipment')}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
          {getError('equipment')}
        </div>
        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700"
          >
            Modelo (ex: Samsung)
          </label>
          <input
            id="model"
            {...register('model')}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
          {getError('model')}
        </div>
        <div>
          <label
            htmlFor="assetTag"
            className="block text-sm font-medium text-gray-700"
          >
            Nº de Patrimônio
          </label>
          <input
            id="assetTag"
            {...register('assetTag')}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
          {getError('assetTag')}
        </div>
      </div>

      {/* --- Botão de Envio --- */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-bold text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Enviando...' : 'Abrir Chamado'}
        </button>
      </div>
    </form>
  );
}
