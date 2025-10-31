'use client'; // Obrigatório para usar hooks

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react'; // Importa o signIn do client-side
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../_components/ui/card';
import { Button } from '../_components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../_components/ui/form';
import { Input } from '../_components/ui/input';

// 1. Schema de Validação (consistente com o backend)
const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'), // No login, só checamos se existe
});

// 2. Componente da Página
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Setup do Formulário com React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 4. Handler de Submissão
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null); // Limpa erros antigos

    try {
      // 5. Usamos o signIn da NextAuth
      const result = await signIn('credentials', {
        ...values,
        redirect: false, // IMPORTANTE: Não redireciona automaticamente
      });

      if (result?.error) {
        // 6. Se o 'authorize' no backend retornar null, 'result.error' será preenchido
        setError('Credenciais inválidas. Verifique seu email e senha.');
        setIsLoading(false);
      } else if (result?.ok) {
        // 7. Sucesso! O middleware cuidará do redirecionamento
        // Mas podemos forçar para garantir.
        router.push('/dashboard'); // Redireciona para o dashboard
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Ocorreu um erro inesperado. Tente novamente.');
      setIsLoading(false);
    }
  }

  // 8. O JSX com os componentes shadcn
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Acessar Sistema
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para abrir ou gerenciar chamados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu.email@empresa.com"
                        {...field}
                        disabled={isLoading}
                      />
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Exibição do Erro */}
              {error && (
                <p className="text-destructive text-sm font-medium">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Registre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
