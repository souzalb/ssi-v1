'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/app/_components/ui/field';
import { Input } from '@/app/_components/ui/input';
import {
  Loader2,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../_lib/utils';

// Schema de Validação
const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

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
        toast.success('Login bem-sucedido!', {
          description: 'Redirecionando para o painel...',
        });
        router.push('/dashboard');
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
    <div
      className={cn('flex w-full flex-col items-center gap-6', className)}
      {...props}
    >
      {/* Card Principal com Glassmorphism */}
      <Card className="group hover:shadow-3xl relative overflow-hidden rounded-3xl border-2 border-white/20 bg-white/10 p-0 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 transition-all hover:border-white/30 md:min-w-[500px]">
        {/* Gradiente decorativo animado */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-linear-to-r from-blue-500 via-cyan-500 to-indigo-700 opacity-80" />

        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <CardHeader className="relative z-10 space-y-3 pt-8 pb-2 text-center">
          {/* Ícone decorativo */}
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 via-cyan-500 to-indigo-700 shadow-lg shadow-purple-500/30 backdrop-blur-xl">
            <ShieldCheck className="h-8 w-8 text-white drop-shadow-lg" />
          </div>

          <CardTitle className="text-xl font-black text-white drop-shadow-lg md:text-3xl">
            Bem-vindo de volta!
          </CardTitle>
          <CardDescription className="text-sm text-white/80 drop-shadow-md md:text-base">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 px-6 pb-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              {/* Campo de Email */}
              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-sm font-semibold text-white drop-shadow-sm"
                >
                  Email
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    className="h-12 rounded-xl border-2 border-white/30 bg-white/20 pl-11 text-base text-white backdrop-blur-xl transition-all placeholder:text-white/50 focus:border-white/60 focus:ring-2 focus:ring-white/20"
                    disabled={isLoading}
                    {...form.register('email')}
                  />
                </div>
                {form.formState.errors.email && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-2 backdrop-blur-xl">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    <p className="text-sm font-medium text-red-200">
                      {form.formState.errors.email.message}
                    </p>
                  </div>
                )}
              </Field>

              {/* Campo de Senha */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-semibold text-white drop-shadow-sm"
                  >
                    Senha
                  </FieldLabel>
                  <a
                    href="#"
                    className="text-sm font-medium text-white/70 transition-colors hover:text-white hover:underline"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/60" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-2 border-white/30 bg-white/20 pr-11 pl-11 text-base text-white backdrop-blur-xl transition-all placeholder:text-white/50 focus:border-white/60 focus:ring-2 focus:ring-white/20"
                    disabled={isLoading}
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-2 backdrop-blur-xl">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    <p className="text-sm font-medium text-red-200">
                      {form.formState.errors.password.message}
                    </p>
                  </div>
                )}
              </Field>

              {/* Botão de Submit */}
              <Field className="pt-2">
                <Button
                  type="submit"
                  className="group/btn relative h-12 w-full overflow-hidden rounded-xl bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-800 text-base font-bold text-white shadow-xl shadow-blue-500/30 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-cyan-500/40 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full" />

                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Autenticando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Entrar no Sistema</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                      </>
                    )}
                  </span>
                </Button>
              </Field>
            </FieldGroup>
          </form>

          {/* Divider decorativo */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/30 to-transparent" />
            <span className="text-xs font-medium text-white/60">
              ACESSO SEGURO
            </span>
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* Info de segurança */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-xl">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-medium text-white/80">
              Conexão criptografada e protegida
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer com termos */}
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center backdrop-blur-xl md:min-w-[500px]">
        <FieldDescription className="text-sm leading-relaxed text-white/70">
          Ao fazer login, você concorda com nossos{' '}
          <a
            href="#"
            className="font-semibold text-white underline-offset-2 transition-colors hover:text-white/90 hover:underline"
          >
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a
            href="#"
            className="font-semibold text-white underline-offset-2 transition-colors hover:text-white/90 hover:underline"
          >
            Política de Privacidade
          </a>
          .
        </FieldDescription>
      </div>
    </div>
  );
}
