'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';

import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error();

      toast.success('Email enviado!', {
        description: 'Verifique a sua caixa de entrada (e spam).',
      });
      setEmailSent(true);
    } catch {
      toast.error('Erro ao enviar email');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/5 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border shadow-2xl backdrop-blur-sm dark:bg-slate-900/50">
        {!emailSent ? (
          <>
            <CardHeader className="space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 p-4 shadow-lg">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-center text-2xl font-bold">
                  Recuperar Acesso
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Digite o seu email e enviaremos um link seguro para redefinir
                  sua senha
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                              className="h-12 pl-11 text-base"
                              placeholder="seu@email.com"
                              type="email"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="h-12 w-full bg-linear-to-r from-blue-600 to-indigo-600 text-base font-medium hover:from-blue-700 hover:to-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Link de Recuperação'
                    )}
                  </Button>
                </form>
              </Form>

              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar ao Login
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 p-4 shadow-lg">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-center text-2xl font-bold">
                  Email Enviado!
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Enviamos um link de recuperação para
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {form.getValues('email')}
                </p>
              </div>

              <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Próximos passos:
                </p>
                <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      1
                    </span>
                    <span>Verifique sua caixa de entrada</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      2
                    </span>
                    <span>Clique no link de recuperação</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      3
                    </span>
                    <span>Crie sua nova senha</span>
                  </li>
                </ol>
              </div>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                Não recebeu o email? Verifique sua pasta de spam ou{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  tente novamente
                </button>
              </p>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
              </div>

              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar ao Login
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
