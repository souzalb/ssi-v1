'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Role, User, Comment } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar';
import { Button } from '@/app/_components/ui/button';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Form,
  FormDescription,
} from '@/app/_components/ui/form';
import { Textarea } from '@/app/_components/ui/textarea';
import { Label } from '@/app/_components/ui/label';
import { Checkbox } from '@/app/_components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/_components/ui/card';
import { Badge } from '@/app/_components/ui/badge';
import {
  MessageSquare,
  Lock,
  Send,
  Loader2,
  Shield,
  User as IconUser,
  Clock,
  AlertCircle,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

type CommentWithUser = Comment & {
  user: Pick<User, 'name' | 'role' | 'photoUrl'>;
};

interface CommentSectionProps {
  ticketId: string;
  initialComments: CommentWithUser[];
  currentUserRole: Role;
}

const formSchema = z.object({
  text: z.string().min(1, 'O comentário não pode estar vazio'),
  isInternal: z.boolean().default(false),
});

const ROLE_CONFIG: Record<
  Role,
  { label: string; color: string; gradient: string }
> = {
  SUPER_ADMIN: {
    label: 'Admin',
    color:
      'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    gradient: 'from-purple-500 to-pink-500',
  },
  MANAGER: {
    label: 'Gerente',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    gradient: 'from-blue-500 to-indigo-500',
  },
  TECHNICIAN: {
    label: 'Técnico',
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
  },
  COMMON: {
    label: 'Usuário',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    gradient: 'from-slate-500 to-slate-600',
  },
};

export function CommentSection({
  ticketId,
  initialComments,
  currentUserRole,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '', isInternal: false },
  });

  async function onSubmit(values: z.input<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const newComment = await response.json();
      if (!response.ok) {
        throw new Error(newComment.error || 'Falha ao adicionar comentário');
      }

      setComments((currentComments) => [...currentComments, newComment]);
      form.reset();
      toast.success('Comentário publicado!', {
        description: values.isInternal
          ? 'Nota interna adicionada ao chamado'
          : 'Seu comentário foi publicado com sucesso',
      });
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      toast.error('Erro ao publicar comentário', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredComments =
    currentUserRole === Role.COMMON
      ? comments.filter((comment) => !comment.isInternal)
      : comments;

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl">
      {/* Gradient decorativo no topo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500" />

      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 p-2 shadow-lg">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              Histórico do Chamado
            </CardTitle>
            <CardDescription className="text-xs">
              Timeline completa de atualizações e respostas
            </CardDescription>
          </div>

          {/* Badge contador */}
          <div className="flex items-center gap-2">
            <Badge className="gap-1.5 border-0 bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-1.5 text-white shadow-lg shadow-pink-500/30">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                {filteredComments.length}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lista de Comentários */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white py-12 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <div className="mb-3 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:from-slate-800 dark:to-slate-700">
                <MessageSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Nenhum comentário ainda
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Seja o primeiro a comentar neste chamado
              </p>
            </div>
          ) : (
            <div className="relative space-y-4">
              {/* Linha vertical de timeline */}
              <div className="absolute top-8 bottom-8 left-5 w-0.5 bg-gradient-to-b from-pink-200 via-slate-200 to-slate-200 sm:left-6 dark:from-pink-800 dark:via-slate-800 dark:to-slate-800" />

              {filteredComments.map((comment, index) => {
                const roleConfig = ROLE_CONFIG[comment.user.role];
                const isInternal = comment.isInternal;
                const isFirst = index === 0;
                const isLast = index === filteredComments.length - 1;

                return (
                  <div
                    key={comment.id}
                    className={`group animate-in slide-in-from-left-4 relative ${
                      isInternal ? 'ml-4 sm:ml-8' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-lg ${
                        isInternal
                          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30'
                          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      {/* Indicador de timeline */}
                      <div
                        className={`absolute top-4 -left-[26px] h-4 w-4 rounded-full border-4 border-white shadow-lg sm:-left-[30px] dark:border-slate-950 ${
                          isFirst
                            ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                            : isLast
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                              : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}
                      />

                      {/* Badge de nota interna */}
                      {isInternal && (
                        <div className="absolute -top-2 right-4">
                          <Badge className="gap-1 border-0 bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-0.5 text-white shadow-lg shadow-amber-500/30">
                            <Lock className="h-3 w-3" />
                            <span className="text-xs font-semibold">
                              Interno
                            </span>
                          </Badge>
                        </div>
                      )}

                      <div className="flex gap-3 sm:gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-lg sm:h-12 sm:w-12 dark:border-slate-900">
                            <AvatarImage src={comment.user.photoUrl || ''} />
                            <AvatarFallback
                              className={`bg-gradient-to-br ${roleConfig.gradient} text-sm font-bold text-white`}
                            >
                              {comment.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {/* Indicador de role */}
                          <div
                            className={`absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-gradient-to-br ${roleConfig.gradient} p-1 shadow-md dark:border-slate-900`}
                          >
                            {comment.user.role === Role.COMMON ? (
                              <IconUser className="h-2.5 w-2.5 text-white" />
                            ) : (
                              <Shield className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="min-w-0 flex-1 space-y-2">
                          {/* Header */}
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {comment.user.name}
                              </span>
                              <Badge
                                className={`${roleConfig.color} h-5 gap-1 border-0 px-2 text-xs font-semibold`}
                              >
                                {roleConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <Clock className="h-3 w-3" />
                              {format(
                                new Date(comment.createdAt),
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )}
                            </div>
                          </div>

                          {/* Texto do comentário */}
                          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulário de Novo Comentário */}
        <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 p-2 shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Adicionar Atualização
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Compartilhe informações ou responda dúvidas
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs font-semibold">
                      Seu Comentário
                    </Label>
                    <FormControl>
                      <Textarea
                        placeholder="Digite sua atualização ou resposta..."
                        className="min-h-[120px] resize-none border-2 transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Seja claro e objetivo na sua comunicação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Checkbox de "Nota Interna" */}
              {currentUserRole !== Role.COMMON && (
                <FormField
                  control={form.control}
                  name="isInternal"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-3 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 border-amber-400 dark:border-amber-600"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="flex-1 space-y-1">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
                            <Lock className="h-4 w-4" />
                            Nota Interna
                          </Label>
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
                            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                              Visível apenas para equipe técnica e gerentes. Não
                              será mostrado ao solicitante.
                            </p>
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 shadow-lg shadow-pink-500/30 hover:from-pink-700 hover:to-rose-700 sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publicar Comentário
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
