'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form';
import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';

// --- Tipos ---
type Area = {
  id: string;
  name: string;
};

// 1. Tipo do usuário que este formulário recebe (da página principal)
type UserData = {
  id: string;
  name: string;
  email: string;
  role: Role;
  area: { name: string } | null;
  areaId?: string | null; // Adicionado para defaultValues
};

// 2. Schema (sem senha, campos opcionais)
const formSchema = z.object({
  name: z.string().min(3, 'Nome muito curto').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum([Role.COMMON, Role.TECHNICIAN, Role.MANAGER, Role.SUPER_ADMIN]),
  areaId: z.string().nullable().optional(), // Permite 'null'
});

// 3. Props do Componente
interface EditUserFormProps {
  user: UserData; // O usuário a ser editado
  onSuccess: () => void;
}

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 4. Setup do Formulário (com defaultValues do usuário)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      areaId: user.areaId || null, // Garante que o valor seja 'null' ou um ID
    },
  });

  // 5. Buscar Áreas (para o Select)
  useEffect(() => {
    async function fetchAreas() {
      try {
        const response = await fetch('/api/areas');
        const data = await response.json();
        setAreas(data);
      } catch (error) {
        console.error('Falha ao buscar áreas', error);
      }
    }
    fetchAreas();
  }, []);

  // 6. Handler de Submissão (PATCH /api/users/[id])
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values), // Envia só os dados modificados
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao atualizar usuário');
      }

      toast.success('Sucesso!', {
        description: `Usuário ${data.name} atualizado.`,
      });
      onSuccess(); // Fecha o modal e recarrega a lista
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* (Campos de Nome, Email, Role, Area - IDÊNTICOS ao create-form) */}
        {/* ... (copie os FormFields de 'name', 'email', 'role' e 'areaId' do create-user-form.tsx) ... */}
        {/* IMPORTANTE: NÃO INCLUIR O CAMPO DE SENHA AQUI */}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Acesso (Role)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Role.COMMON}>Usuário Comum</SelectItem>
                  <SelectItem value={Role.TECHNICIAN}>Técnico</SelectItem>
                  <SelectItem value={Role.MANAGER}>Gestor</SelectItem>
                  <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="areaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área (Opcional)</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === 'none' ? null : value)
                }
                defaultValue={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhuma Área</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </Form>
  );
}
