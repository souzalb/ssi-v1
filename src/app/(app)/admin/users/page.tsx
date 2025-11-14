'use client';

import { useEffect, useState } from 'react';
import { AreaName, Role } from '@prisma/client';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  UserPlus,
  Users,
  Shield,
  Building2,
  Search,
  Edit,
  Trash2,
  UserCircle,
  Mail,
  Sparkles,
  Filter,
  ChevronRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/ui/dialog';
import { Button, buttonVariants } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/_components/ui/card';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '@/app/_components/ui/table';
import { Input } from '@/app/_components/ui/input';
import { CreateUserForm } from './_components/create-user-form';
import { EditUserForm } from './_components/edit-user-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/_components/ui/alert-dialog';
import { Badge } from '@/app/_components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';
import { cn } from '@/app/_lib/utils';

// Tipo do Usuário
type UserWithArea = {
  id: string;
  name: string;
  email: string;
  role: Role;
  area: {
    id: string;
    name: AreaName;
  } | null;
  createdAt: string;
  areaId?: string | null;
};

// Tipo da Área
type Area = {
  id: string;
  name: AreaName;
};

// Configuração de Roles
const ROLE_CONFIG = {
  [Role.SUPER_ADMIN]: {
    label: 'Super Admin',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100/80 dark:bg-purple-950/40',
    borderColor: 'border-purple-200/60 dark:border-purple-800/60',
    icon: Shield,
  },
  [Role.MANAGER]: {
    label: 'Gerente',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100/80 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200/60 dark:border-emerald-800/60',
    icon: Building2,
  },
  [Role.TECHNICIAN]: {
    label: 'Técnico',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100/80 dark:bg-amber-950/40',
    borderColor: 'border-amber-200/60 dark:border-amber-800/60',
    icon: UserCircle,
  },
  [Role.COMMON]: {
    label: 'Usuário',
    color: 'text-slate-700 dark:text-slate-400',
    bgColor: 'bg-slate-100/80 dark:bg-slate-800/80',
    borderColor: 'border-slate-200/60 dark:border-slate-700/60',
    icon: UserCircle,
  },
};

const areaLabels: Record<AreaName, string> = {
  TI: 'TI',
  BUILDING: 'Predial',
  ELECTRICAL: 'Elétrica',
};

const areaColors: Record<AreaName, string> = {
  TI: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  BUILDING:
    'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800',
  ELECTRICAL:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithArea[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Estados dos modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithArea | null>(null);

  // Buscar usuários e áreas
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, areasResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/areas'),
      ]);

      if (!usersResponse.ok) throw new Error('Falha ao buscar usuários');
      if (!areasResponse.ok) throw new Error('Falha ao buscar áreas');

      const usersData = await usersResponse.json();
      const areasData = await areasResponse.json();

      setUsers(usersData);
      setAreas(areasData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao carregar dados', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const onUserCreated = () => {
    setIsCreateModalOpen(false);
    fetchData();
  };

  const onUserUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    fetchData();
  };

  const openEditModal = (user: UserWithArea) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteAlert = (user: UserWithArea) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao deletar usuário');
      }

      toast.success('Usuário deletado com sucesso!', {
        description: `${selectedUser.name} foi removido do sistema.`,
      });
      fetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao deletar', { description: error.message });
    } finally {
      setIsDeleteAlertOpen(false);
      setSelectedUser(null);
    }
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setAreaFilter('all');
  };

  // Filtros
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesArea =
      areaFilter === 'all' ||
      (areaFilter === 'none' && !user.areaId) ||
      user.areaId === areaFilter;
    return matchesSearch && matchesRole && matchesArea;
  });

  // Estatísticas
  const totalUsers = users.length;
  const usersByRole = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    {} as Record<Role, number>,
  );

  const hasActiveFilters =
    searchTerm !== '' || roleFilter !== 'all' || areaFilter !== 'all';

  return (
    <div className="min-h-screen p-4 md:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Administração
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Usuários
              </span>
            </div>
            <div>
              <h1 className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent md:text-3xl dark:from-white dark:to-slate-300">
                Gerenciamento de Usuários
              </h1>
              <p className="text-sm text-slate-600 md:text-base dark:text-slate-400">
                Gerencie usuários, permissões e acessos do sistema.
              </p>
            </div>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="gap-2 rounded-lg bg-linear-to-r from-blue-500 to-indigo-600 font-bold shadow-lg backdrop-blur-xl transition-all hover:shadow-xl"
              >
                <UserPlus className="h-5 w-5" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] dark:bg-slate-900">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <UserPlus className="h-6 w-6" />
                  Criar Novo Usuário
                </DialogTitle>
              </DialogHeader>
              <CreateUserForm onSuccess={onUserCreated} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Usuários"
            value={totalUsers}
            icon={Users}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Administradores"
            value={
              (usersByRole[Role.SUPER_ADMIN] || 0) +
              (usersByRole[Role.MANAGER] || 0)
            }
            icon={Shield}
            gradient="from-purple-500 to-pink-600"
          />
          <StatCard
            title="Gerentes"
            value={usersByRole[Role.MANAGER] || 0}
            icon={Building2}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Técnicos"
            value={usersByRole[Role.TECHNICIAN] || 0}
            icon={UserCircle}
            gradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* Filtros e Busca */}
        <Card className="border-0 p-0 shadow-xl backdrop-blur-xl dark:bg-slate-900">
          <CardContent className="flex flex-col space-y-4 p-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
              <div className="relative md:col-span-8">
                <Search className="absolute top-1/2 left-2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 rounded-lg border-2 pl-10 text-base backdrop-blur-xl"
                />
              </div>
              <div className="flex flex-col items-center gap-2 md:flex-row lg:col-span-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-12 w-full rounded-lg border-2 text-base backdrop-blur-xl">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-12 w-full rounded-lg border-2 text-base backdrop-blur-xl">
                    <Building2 className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-400" />
                        Sem área
                      </div>
                    </SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          {areaLabels[area.name] || area.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Badge de filtros ativos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Filtros ativos:
                </span>
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="gap-1 rounded-lg backdrop-blur-xl"
                  >
                    Busca: {searchTerm}
                  </Badge>
                )}
                {roleFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className={`gap-1 rounded-lg backdrop-blur-xl ${ROLE_CONFIG[roleFilter as Role]?.bgColor} ${ROLE_CONFIG[roleFilter as Role]?.color}`}
                  >
                    Nível: {ROLE_CONFIG[roleFilter as Role]?.label}
                  </Badge>
                )}
                {areaFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className={`gap-1 rounded-lg backdrop-blur-xl ${
                      areaFilter === 'none'
                        ? 'border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : areaColors[
                            areas.find((a) => a.id === areaFilter)
                              ?.name as AreaName
                          ] || 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    Área:{' '}
                    {areaFilter === 'none'
                      ? 'Sem área'
                      : areaLabels[
                          areas.find((a) => a.id === areaFilter)
                            ?.name as AreaName
                        ] || 'N/A'}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 rounded-lg text-xs"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card className="relative gap-0 overflow-hidden border-0 p-0 pt-1 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

          <CardHeader className="border-b bg-linear-to-r from-blue-50/80 to-indigo-50/80 p-6 backdrop-blur-xl dark:from-blue-950/30 dark:to-indigo-950/30 [.border-b]:pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg backdrop-blur-xl">
                <Users className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Lista de Usuários
                </CardTitle>
                <CardDescription className="text-sm">
                  {filteredUsers.length} usuário
                  {filteredUsers.length !== 1 ? 's' : ''} encontrado
                  {filteredUsers.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 dark:bg-slate-900">
            <div className="overflow-x-auto rounded-lg border p-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-900">
                    <TableHead className="font-bold">Nome</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Nível</TableHead>
                    <TableHead className="font-bold">Área</TableHead>
                    <TableHead className="text-right font-bold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Carregando usuários...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            Nenhum usuário encontrado
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Tente ajustar os filtros de busca
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const roleConfig = ROLE_CONFIG[user.role];
                      const RoleIcon = roleConfig.icon;

                      return (
                        <TableRow
                          key={user.id}
                          className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-md backdrop-blur-xl">
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {user.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'gap-1.5 rounded-xl border-2 font-semibold backdrop-blur-xl',
                                roleConfig.bgColor,
                                roleConfig.color,
                                roleConfig.borderColor,
                              )}
                            >
                              <RoleIcon className="h-3.5 w-3.5" />
                              {roleConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.area ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {areaLabels[user.area.name] || user.area.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-500 dark:text-slate-500">
                                N/A
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl transition-opacity"
                                >
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 backdrop-blur-xl"
                              >
                                <DropdownMenuLabel className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4" />
                                  Ações
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openEditModal(user)}
                                  className="cursor-pointer gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Editar usuário
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/30"
                                  onClick={() => openDeleteAlert(user)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Deletar usuário
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Edit className="h-6 w-6" />
              Editar Usuário
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm user={selectedUser} onSuccess={onUserUpdated} />
          )}
        </DialogContent>
      </Dialog>

      {/* Alerta de Exclusão */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <Trash2 className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Esta ação não pode ser desfeita. O usuário{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {selectedUser?.name}
              </span>{' '}
              será permanentemente removido do sistema, incluindo todos os seus
              dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border-2">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className={cn(
                buttonVariants({ variant: 'destructive' }),
                'gap-2 rounded-lg font-bold',
              )}
            >
              <Trash2 className="h-4 w-4" />
              Deletar Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Componente de Card de Estatísticas
function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl">
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-5`}
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {value}
            </p>
          </div>
          <div
            className={`rounded-2xl bg-linear-to-br ${gradient} p-4 shadow-lg backdrop-blur-xl transition-transform group-hover:scale-110`}
          >
            <Icon className="h-8 w-8 text-white drop-shadow-sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
