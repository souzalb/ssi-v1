'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
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
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Save,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/app/_lib/utils';

// Schema com validações e confirmação
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Deve conter pelo menos um número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Validações de força da senha
  const newPassword = form.watch('newPassword');
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasAllRequirements =
    hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  // Verifica se há mudanças
  const hasChanges =
    form.watch('currentPassword') ||
    form.watch('newPassword') ||
    form.watch('confirmPassword');

  // Força da senha
  const passwordStrength = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
  ].filter(Boolean).length;
  const strengthColor =
    passwordStrength === 0
      ? 'bg-slate-200'
      : passwordStrength === 1
        ? 'bg-red-500'
        : passwordStrength === 2
          ? 'bg-orange-500'
          : passwordStrength === 3
            ? 'bg-amber-500'
            : 'bg-emerald-500';
  const strengthLabel =
    passwordStrength === 0
      ? ''
      : passwordStrength === 1
        ? 'Fraca'
        : passwordStrength === 2
          ? 'Média'
          : passwordStrength === 3
            ? 'Boa'
            : 'Forte';

  // Handler de submissão
  async function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao atualizar');

      toast.success('Senha alterada com sucesso!');
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao alterar senha', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="group relative overflow-hidden border-2 shadow-xl transition-all hover:shadow-2xl">
      {/* Gradient decorativo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <CardHeader className="border-b bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Segurança</CardTitle>
            <CardDescription className="text-sm">
              Mantenha sua conta segura alterando sua senha regularmente
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Senha Atual */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Senha Atual
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        {...field}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="h-12 border-2 pr-10 pl-10"
                        placeholder="Digite sua senha atual"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription className="text-sm">
                    Confirme sua identidade com a senha atual.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nova Senha */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Nova Senha
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        {...field}
                        type={showNewPassword ? 'text' : 'password'}
                        className="h-12 border-2 pr-10 pl-10"
                        placeholder="Digite sua nova senha"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  {/* Indicador de força da senha */}
                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className={cn(
                              'h-full transition-all duration-300',
                              strengthColor,
                            )}
                            style={{
                              width: `${(passwordStrength / 4) * 100}%`,
                            }}
                          />
                        </div>
                        {strengthLabel && (
                          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            {strengthLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <FormDescription className="text-sm">
                    Crie uma senha forte e única.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requisitos da senha */}
            {newPassword && (
              <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Requisitos da senha:
                </p>
                <div className="space-y-2">
                  <RequirementItem
                    met={hasMinLength}
                    text="Mínimo de 8 caracteres"
                  />
                  <RequirementItem
                    met={hasUpperCase}
                    text="Uma letra maiúscula (A-Z)"
                  />
                  <RequirementItem
                    met={hasLowerCase}
                    text="Uma letra minúscula (a-z)"
                  />
                  <RequirementItem met={hasNumber} text="Um número (0-9)" />
                </div>
              </div>
            )}

            {/* Confirmar Senha */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Confirmar Nova Senha
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="h-12 border-2 pr-10 pl-10"
                        placeholder="Confirme sua nova senha"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription className="text-sm">
                    Digite a mesma senha para confirmar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Box */}
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Dicas de segurança
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>• Use uma combinação de letras, números e símbolos</li>
                    <li>• Evite informações pessoais óbvias</li>
                    <li>• Não reutilize senhas de outras contas</li>
                    <li>• Considere usar um gerenciador de senhas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={isLoading || !hasChanges || !hasAllRequirements}
                className="flex-1 gap-2 bg-linear-to-r from-emerald-500 to-teal-600 font-bold shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Alterando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Alterar Senha</span>
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Componente auxiliar para os requisitos
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
          met
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-200 text-slate-400 dark:bg-slate-700',
        )}
      >
        {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </div>
      <span
        className={cn(
          'text-sm transition-colors',
          met
            ? 'font-medium text-emerald-700 dark:text-emerald-400'
            : 'text-slate-600 dark:text-slate-400',
        )}
      >
        {text}
      </span>
    </div>
  );
}
