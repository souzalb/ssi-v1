'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  ArrowRight,
  KeyRound,
} from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsLoading(true);

    // Simular login
    setTimeout(() => {
      console.log('Login:', values);
      alert('Login bem-sucedido!');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 animate-pulse rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50">
            <Shield className="h-10 w-10 text-white drop-shadow-lg" />
          </div>
          <h1 className="mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent">
            Sistema de Tickets
          </h1>
          <p className="text-sm text-slate-400">
            Faça login para acessar sua conta
          </p>
        </div>

        {/* Card Principal */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
          {/* Gradient decorativo no topo */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          {/* Floating elements */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-xl">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-400">
                Seguro
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Mail className="h-4 w-4 text-blue-400" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="seu.email@empresa.com"
                    disabled={isLoading}
                    {...form.register('email')}
                    className="w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-xl transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 focus:outline-none disabled:opacity-50"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="flex items-center gap-1 text-sm text-red-400">
                    <span className="text-xs">⚠</span>
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Lock className="h-4 w-4 text-purple-400" />
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs text-blue-400 transition-colors hover:text-blue-300 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...form.register('password')}
                    className="w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3.5 pr-12 text-white backdrop-blur-xl transition-all placeholder:text-slate-500 focus:border-purple-500/50 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="flex items-center gap-1 text-sm text-red-400">
                    <span className="text-xs">⚠</span>
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span className="text-sm text-slate-300">Lembrar-me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 p-[2px] shadow-lg shadow-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/70 disabled:opacity-50"
              >
                <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 px-6 py-3.5 text-white transition-all">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="font-bold">Entrando...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-5 w-5" />
                      <span className="font-bold">Entrar na Conta</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900/50 px-4 text-slate-400 backdrop-blur-xl">
                    ou continue com
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Login com Google');
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Login com GitHub');
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>

          {/* Footer Card */}
          <div className="border-t border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-center text-sm text-slate-400">
              Não tem uma conta?{' '}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  alert('Redirecionar para cadastro');
                }}
                className="font-semibold text-blue-400 transition-colors hover:text-blue-300 hover:underline"
              >
                Cadastre-se agora
              </button>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Ao fazer login, você concorda com nossos{' '}
          <button className="text-slate-400 hover:text-slate-300 hover:underline">
            Termos de Serviço
          </button>{' '}
          e{' '}
          <button className="text-slate-400 hover:text-slate-300 hover:underline">
            Política de Privacidade
          </button>
        </p>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">
            Conexão segura e criptografada
          </span>
        </div>
      </div>
    </div>
  );
}
