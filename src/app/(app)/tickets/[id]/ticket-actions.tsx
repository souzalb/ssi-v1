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
  CardDescription,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
  FormDescription,
} from '@/app/_components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';
import {
  UserPlus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import { Badge } from '@/app/_components/ui/badge';

/* eslint-disable */

type Technician = Pick<User, 'id' | 'name'>;
type CurrentUser = Pick<User, 'id' | 'role' | 'areaId'>;

interface TicketActionsProps {
  ticket: Pick<Ticket, 'id' | 'status' | 'technicianId' | 'areaId'>;
  currentUser: CurrentUser;
}

const assignSchema = z.object({
  technicianId: z.string().nullable(),
});

const statusSchema = z.object({
  status: z.nativeEnum(Status),
});

// Configuração de cores e labels para status
const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  [Status.OPEN]: {
    label: 'Aberto',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    icon: AlertCircle,
  },
  [Status.ASSIGNED]: {
    label: 'Atribuído',
    color:
      'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    icon: UserPlus,
  },
  [Status.IN_PROGRESS]: {
    label: 'Em Andamento',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    icon: RefreshCw,
  },
  [Status.ON_HOLD]: {
    label: 'Em Espera',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    icon: AlertCircle,
  },
  [Status.RESOLVED]: {
    label: 'Resolvido',
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  [Status.CLOSED]: {
    label: 'Fechado',
    color:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
    icon: CheckCircle2,
  },
  [Status.CANCELLED]: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    icon: AlertCircle,
  },
};

export function TicketActions({ ticket, currentUser }: TicketActionsProps) {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isAssignLoading, setIsAssignLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const { role, areaId, id: userId } = currentUser;

  const isSuperAdmin = role === Role.SUPER_ADMIN;
  const isManager = role === Role.MANAGER && ticket.areaId === areaId;
  const isAssignedTech =
    role === Role.TECHNICIAN && ticket.technicianId === userId;

  const canAssignTech = isSuperAdmin || isManager;
  const canUpdateStatus = isSuperAdmin || isManager || isAssignedTech;

  const assignForm = useForm<z.infer<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: { technicianId: ticket.technicianId || null },
  });

  const statusForm = useForm<z.infer<typeof statusSchema>>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: ticket.status },
  });

  useEffect(() => {
    if (canAssignTech) {
      async function fetchTechnicians() {
        try {
          const response = await fetch('/api/users?role=TECHNICIAN');
          if (!response.ok) throw new Error('Falha ao buscar técnicos');
          const data = await response.json();
          setTechnicians(data);
        } catch (error: any) {
          toast.error('Erro ao carregar técnicos', {
            description: error.message,
          });
        }
      }
      fetchTechnicians();
    }
  }, [canAssignTech]);

  async function handleUpdate(values: {
    technicianId?: string | null;
    status?: Status;
  }) {
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

      toast.success(
        values.technicianId !== undefined
          ? 'Técnico atribuído com sucesso!'
          : 'Status atualizado com sucesso!',
        {
          description: values.status
            ? `Status alterado para: ${STATUS_CONFIG[values.status].label}`
            : undefined,
        },
      );

      router.refresh();
    } catch (error: any) {
      toast.error('Erro ao atualizar', { description: error.message });
    } finally {
      isLoading ? setIsAssignLoading(false) : setIsStatusLoading(false);
    }
  }

  if (!canUpdateStatus) {
    return null;
  }

  // Determina o badge de permissão do usuário
  const getRoleInfo = () => {
    if (isSuperAdmin)
      return {
        label: 'Super Admin',
        color:
          'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30',
        icon: Shield,
      };
    if (isManager)
      return {
        label: 'Gerente',
        color:
          'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30',
        icon: Zap,
      };
    return {
      label: 'Técnico',
      color:
        'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30',
      icon: Users,
    };
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl">
      {/* Gradient decorativo no topo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-indigo-500" />

      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              Ações do Chamado
            </CardTitle>
            <CardDescription className="text-xs">
              Gerencie atribuições e status do ticket
            </CardDescription>
          </div>

          {/* Badge de permissão */}
          <Badge className={`${roleInfo.color} gap-1.5 border-0 px-3 py-1`}>
            <RoleIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{roleInfo.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Formulário de Atribuição */}
        {canAssignTech && (
          <div className="space-y-4 rounded-xl border-2 border-purple-200 bg-linear-to-br from-purple-50 to-indigo-50 p-4 dark:border-purple-800 dark:from-purple-950/30 dark:to-indigo-950/30">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 p-2 shadow-lg">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Atribuir Técnico
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Designe um técnico responsável pelo chamado
                </p>
              </div>
            </div>

            <Form {...assignForm}>
              <form
                onSubmit={assignForm.handleSubmit((v) =>
                  handleUpdate({ technicianId: v.technicianId }),
                )}
                className="space-y-3"
              >
                <FormField
                  control={assignForm.control}
                  name="technicianId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        Selecionar Técnico
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === 'none' ? null : value)
                        }
                        defaultValue={field.value || 'none'}
                        disabled={isAssignLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="border-2 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                            <SelectValue placeholder="Selecione um técnico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-slate-400" />
                              Não atribuído
                            </div>
                          </SelectItem>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-500" />
                                {tech.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        {technicians.length} técnico(s) disponível(is)
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-linear-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-indigo-700"
                  disabled={isAssignLoading}
                >
                  {isAssignLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atribuindo...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Atribuir Técnico
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Formulário de Status */}
        <div className="space-y-4 rounded-xl border-2 border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Alterar Status
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Atualize o status atual do chamado
              </p>
            </div>
            {/* Badge do status atual */}
            <Badge
              className={`${STATUS_CONFIG[ticket.status].color} gap-1.5 border-0 px-2.5 py-1 text-xs font-semibold`}
            >
              {STATUS_CONFIG[ticket.status].label}
            </Badge>
          </div>

          <Form {...statusForm}>
            <form
              onSubmit={statusForm.handleSubmit((v) =>
                handleUpdate({ status: v.status }),
              )}
              className="space-y-3"
            >
              <FormField
                control={statusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Novo Status
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isStatusLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Status).map((s) => {
                          const StatusIcon = STATUS_CONFIG[s].icon;
                          return (
                            <SelectItem key={s} value={s}>
                              <div className="flex items-center gap-2">
                                <StatusIcon className="h-3.5 w-3.5" />
                                {STATUS_CONFIG[s].label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Selecione o novo status para este chamado
                    </FormDescription>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="sm"
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700"
                disabled={isStatusLoading}
              >
                {isStatusLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Atualizar Status
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
