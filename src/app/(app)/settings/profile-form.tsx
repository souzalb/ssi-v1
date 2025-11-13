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
  FormDescription,
} from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { useSession } from 'next-auth/react';
import {
  UserCircle,
  Mail,
  Loader2,
  Save,
  AlertCircle,
  Lock,
} from 'lucide-react';

// Schema do formulário
const profileFormSchema = z.object({
  name: z.string().min(3, 'Nome muito curto').max(100, 'Nome muito longo'),
});

interface ProfileFormProps {
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

  // Verifica se houve mudanças
  const hasChanges = form.watch('name') !== user.name;

  // Handler de submissão
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
        name: data.name,
      });

      toast.success('Perfil atualizado com sucesso!');
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="group relative overflow-hidden border-2 shadow-xl transition-all hover:shadow-2xl">
      {/* Gradient decorativo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

      <CardHeader className="border-b bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-linear-to-br from-blue-500 to-purple-600 p-2.5 shadow-lg">
            <UserCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Informações do Perfil
            </CardTitle>
            <CardDescription className="text-sm">
              Personalize seu nome de exibição no sistema
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Nome Completo
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserCircle className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        {...field}
                        className="h-12 border-2 pl-10"
                        placeholder="Digite seu nome completo"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-sm">
                    Este nome será exibido em todo o sistema.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Email (desabilitado) */}
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Endereço de Email
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    disabled
                    value={user.email}
                    className="h-12 border-2 pl-10 opacity-60"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </FormControl>
              <FormDescription className="flex items-center gap-1.5 text-sm">
                <AlertCircle className="h-3.5 w-3.5" />O email não pode ser
                alterado por questões de segurança.
              </FormDescription>
            </FormItem>

            {/* Info Box */}
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                  <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Sobre suas informações
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>• Seu nome será visível para outros usuários</li>
                    <li>• O email é usado apenas para login e notificações</li>
                    <li>
                      • As alterações serão aplicadas imediatamente em todo o
                      sistema
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="flex-1 gap-2 bg-linear-to-r from-blue-500 to-purple-600 font-bold shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </Button>

              {hasChanges && !isLoading && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  className="gap-2 border-2"
                  size="lg"
                >
                  Cancelar
                </Button>
              )}
            </div>

            {/* Indicador de mudanças */}
            {hasChanges && (
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Você tem alterações não salvas
                  </p>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
