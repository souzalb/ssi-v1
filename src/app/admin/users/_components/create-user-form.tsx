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

// 1. Schema de Validação (deve bater com o da API)
const formSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  role: z.enum([Role.COMMON, Role.TECHNICIAN, Role.MANAGER, Role.SUPER_ADMIN]),
  areaId: z.string().optional(),
});

// 2. Props do Componente
interface CreateUserFormProps {
  // Função para fechar o modal e recarregar a lista
  onSuccess: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  // O 'toast' é importado diretamente, não usamos mais o hook 'useToast'
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Setup do Formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: Role.COMMON, // Padrão
    },
  });

  // 4. Buscar Áreas (para o Select)
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

  // 5. Handler de Submissão (POST /api/users)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar usuário');
      }

      // 6. Sucesso (usando o sonner)
      toast.success('Sucesso!', {
        description: `Usuário ${data.name} criado.`,
      });
      onSuccess(); // Chama a função do pai (para fechar o modal e recarregar)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // 7. Erro (usando o sonner)
      toast.error('Erro', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 8. O JSX
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do usuário" {...field} />
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
                <Input placeholder="email@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha Provisória</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Campo de Role --- */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Acesso (Role)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
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

        {/* --- Campo de Área --- */}
        <FormField
          control={form.control}
          name="areaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área (se aplicável)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
          {isLoading ? 'Salvando...' : 'Salvar Usuário'}
        </Button>
      </form>
    </Form>
  );
}
