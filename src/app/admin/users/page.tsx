'use client';

import { useEffect, useState } from 'react';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/ui/dialog';
import { Button, buttonVariants } from '@/app/_components/ui/button';
import { Card, CardContent } from '@/app/_components/ui/card';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '@/app/_components/ui/table';

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
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';

// 1. Tipo do Usuário (vindo da API GET /api/users)
type UserWithArea = {
  id: string;
  name: string;
  email: string;
  role: Role;
  area: {
    name: string;
  } | null;
  createdAt: string;
  areaId?: string | null; // (Necessário para o form de edição)
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Novos Estados para os Modais ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserWithArea | null>(null);

  // 2. Função para buscar usuários
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Falha ao buscar usuários');
      const data = await response.json();
      setUsers(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao buscar usuários', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Buscar usuários no carregamento da página
  useEffect(() => {
    fetchUsers();
  }, []);

  // 4. Handlers de Sucesso (chamados pelos formulários)
  const onUserCreated = () => {
    setIsCreateModalOpen(false);
    fetchUsers();
  };

  const onUserUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  // 5. Handlers dos Modais
  const openEditModal = (user: UserWithArea) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteAlert = (user: UserWithArea) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  // 6. Handler de Exclusão
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

      toast.success('Usuário deletado', {
        description: `${selectedUser.name} foi removido do sistema.`,
      });
      fetchUsers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao deletar', { description: error.message });
    } finally {
      setIsDeleteAlertOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>

        {/* --- Modal de CRIAÇÃO --- */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <CreateUserForm onSuccess={onUserCreated} />
          </DialogContent>
        </Dialog>
      </header>

      {/* --- Tabela de Usuários --- */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nível (Role)</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}
              {/* ... (Tratamento de tabela vazia) ... */}

              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.area?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {/* --- Botão de Ações (Dropdown) --- */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditModal(user)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteAlert(user)}
                        >
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Modal de EDIÇÃO (renderizado fora da tabela) --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm user={selectedUser} onSuccess={onUserUpdated} />
          )}
        </DialogContent>
      </Dialog>

      {/* --- Alerta de EXCLUSÃO (renderizado fora da tabela) --- */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente
              o usuário{' '}
              <span className="font-medium">{selectedUser?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
