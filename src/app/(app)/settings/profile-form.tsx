'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User } from '@prisma/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { useSession } from 'next-auth/react';

// Schema (do frontend)
const profileFormSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
});

interface ProfileFormProps {
  // Recebe os dados do usuário do Server Component
  user: Pick<User, 'name' | 'email'>;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { update } = useSession();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
    },
  });

  // Handler de Submissão (PATCH /api/users/profile)
  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao atualizar');

      await update({
        name: data.name, // 'data.name' é o novo nome vindo da API
      });

      toast.success('Perfil atualizado!');

      // IMPORTANTE:
      // Força o Next.js a buscar novamente os dados do Server Component (o Header)
      // Isso atualizará o nome do usuário no Header sem um reload total.
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Atualize seu nome de exibição. Seu email não pode ser alterado.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled value={user.email} />
              </FormControl>
            </FormItem>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
