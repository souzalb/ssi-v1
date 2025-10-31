'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Role, Status, Ticket, User } from '@prisma/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
} from '@/app/_components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';

// --- Tipos ---
// O tipo do usuário que vem da API GET /api/users
type Technician = Pick<User, 'id' | 'name'>;

// O tipo do usuário logado (da sessão)
type CurrentUser = Pick<User, 'id' | 'role' | 'areaId'>;

// Props que este componente recebe da página
interface TicketActionsProps {
  ticket: Pick<Ticket, 'id' | 'status' | 'technicianId' | 'areaId'>;
  currentUser: CurrentUser;
}

// 1. Schemas de Validação
const assignSchema = z.object({
  technicianId: z.string().nullable(), // 'null' para desatribuir
});

const statusSchema = z.object({
  status: z.nativeEnum(Status),
});

export function TicketActions({ ticket, currentUser }: TicketActionsProps) {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isAssignLoading, setIsAssignLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  // 2. Lógica de Permissões (RBAC) - Client-side
  const { role, areaId, id: userId } = currentUser;

  const isSuperAdmin = role === Role.SUPER_ADMIN;
  const isManager = role === Role.MANAGER && ticket.areaId === areaId;
  const isAssignedTech =
    role === Role.TECHNICIAN && ticket.technicianId === userId;

  // Permissões para as ações
  const canAssignTech = isSuperAdmin || isManager;
  const canUpdateStatus = isSuperAdmin || isManager || isAssignedTech;

  // 3. Setup dos Formulários
  const assignForm = useForm<z.infer<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: { technicianId: ticket.technicianId || null },
  });

  const statusForm = useForm<z.infer<typeof statusSchema>>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: ticket.status },
  });

  // 4. Buscar Técnicos (apenas se o usuário puder atribuir)
  useEffect(() => {
    if (canAssignTech) {
      async function fetchTechnicians() {
        try {
          // Usamos a API que modificamos (só retorna técnicos)
          const response = await fetch('/api/users?role=TECHNICIAN');
          if (!response.ok) throw new Error('Falha ao buscar técnicos');
          const data = await response.json();
          setTechnicians(data);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast.error('Erro ao carregar técnicos', {
            description: error.message,
          });
        }
      }
      fetchTechnicians();
    }
  }, [canAssignTech]);

  // 5. Handler de Submissão (PATCH /api/tickets/[id])
  async function handleUpdate(values: {
    technicianId?: string | null;
    status?: Status;
  }) {
    // Define qual loader ativar
    const isLoading = values.technicianId !== undefined;
    isLoading ? setIsAssignLoading(true) : setIsStatusLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao atualizar');

      toast.success('Chamado atualizado!');

      // 6. ATUALIZA A PÁGINA (A Mágica)
      // Força o Next.js a buscar os dados do Server Component novamente
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao atualizar', { description: error.message });
    } finally {
      isLoading ? setIsAssignLoading(false) : setIsStatusLoading(false);
    }
  }

  // 7. Se o usuário não puder fazer nada, não renderiza o card
  if (!canUpdateStatus) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Formulário de Atribuição (só para Admin/Manager) --- */}
        {canAssignTech && (
          <Form {...assignForm}>
            <form
              onSubmit={assignForm.handleSubmit((v) =>
                handleUpdate({ technicianId: v.technicianId }),
              )}
              className="space-y-2"
            >
              <FormField
                control={assignForm.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atribuir Técnico</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'none' ? null : value)
                      }
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um técnico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Não atribuído</SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={isAssignLoading}
              >
                {isAssignLoading ? 'Salvando...' : 'Atribuir'}
              </Button>
            </form>
          </Form>
        )}

        {/* --- Formulário de Status (para todos que podem atualizar) --- */}
        <Form {...statusForm}>
          <form
            onSubmit={statusForm.handleSubmit((v) =>
              handleUpdate({ status: v.status }),
            )}
            className="space-y-2"
          >
            <FormField
              control={statusForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mudar Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(Status).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={isStatusLoading}
            >
              {isStatusLoading ? 'Salvando...' : 'Mudar Status'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
