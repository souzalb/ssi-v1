'use client';

// --- Hooks e Lógica ---
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

// --- Componentes de UI ---
import { Button } from '@/app/_components/ui/button'; // (Ajuste o caminho se necessário)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
// (Estes são componentes de UI do seu novo template)
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/app/_components/ui/field'; // (Ajuste o caminho se necessário)
import { Input } from '@/app/_components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '../_lib/utils';

// 1. Schema de Validação (do seu ficheiro original)
const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type FormValues = z.infer<typeof formSchema>;

// 2. Componente de Formulário
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 3. Setup do Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 4. Handler de Submissão (do seu ficheiro original, com 'toast')
  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        ...values,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Credenciais inválidas', {
          description: 'Por favor, verifique o seu email e senha.',
        });
      } else if (result?.ok) {
        toast.success('Login bem-sucedido!');
        router.push('/dashboard'); // O middleware também trata disto
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Ocorreu um erro inesperado', {
        description: 'Por favor, tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="relative overflow-hidden border border-white/20 bg-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.17)] backdrop-blur-xl before:absolute before:inset-0 before:rounded-xl before:bg-linear-to-br before:from-white/20 before:to-transparent">
        <CardHeader className="relative z-10 text-center">
          <CardTitle className="text-xl text-white drop-shadow-md">
            Acessar ao Sistema
          </CardTitle>
          <CardDescription className="text-white/80">
            Entre com o seu email e senha
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          {/* Formulário (igual ao seu) */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-white">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  className="border-white/30 bg-white/20 text-white placeholder:text-white/60 focus:border-white/50"
                  disabled={isLoading}
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-300">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-white">
                    Senha
                  </FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm text-white/70 underline-offset-4 hover:underline"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="border-white/30 bg-white/20 text-white placeholder:text-white/60 focus:border-white/50"
                  disabled={isLoading}
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-300">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full bg-white/30 text-white backdrop-blur-md hover:bg-white/50"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? 'A entrar...' : 'Entrar'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-white/70">
        Ao clicar em entrar, você concorda com nossos{' '}
        <a href="#">Termos de Serviço</a> e{' '}
        <a href="#">Política de Privacidade</a>.
      </FieldDescription>
    </div>
  );
}
