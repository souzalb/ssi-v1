'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, KeyRound, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/_components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/app/_components/ui/form';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Um número', met: /\d/.test(password) },
  ];

  const strength = requirements.filter((r) => r.met).length;
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
  ];
  const strengthLabels = ['Fraca', 'Razoável', 'Boa', 'Forte'];

  if (password.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < strength
                ? strengthColors[strength - 1]
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Força:{' '}
          <span className="font-medium">{strengthLabels[strength - 1]}</span>
        </p>
      )}
      <ul className="space-y-1">
        {requirements.map((req, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 text-xs transition-colors ${
              req.met
                ? 'text-green-600 dark:text-green-400'
                : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            {req.met ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = form.watch('password');

  async function onSubmit(values: z.infer<typeof schema>) {
    if (!token) {
      toast.error('Token inválido.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: values.password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Senha alterada com sucesso!');
      router.push('/login');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-700 dark:bg-red-900/20 dark:text-red-400">
        <X className="mx-auto mb-2 h-8 w-8" />
        <p className="font-medium">Link inválido ou incompleto</p>
        <p className="mt-1 text-sm">
          Por favor, solicite um novo link de redefinição.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Nova Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
              <PasswordStrengthIndicator password={password} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Confirmar Senha
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Digite novamente sua senha"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Nova Senha'
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border shadow-2xl backdrop-blur-sm dark:bg-slate-900/50">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 p-4 shadow-lg">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-center text-2xl font-bold">
              Definir Nova Senha
            </CardTitle>
            <CardDescription className="text-center text-base">
              Crie uma senha forte e segura para proteger sua conta
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            }
          >
            <ResetForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
