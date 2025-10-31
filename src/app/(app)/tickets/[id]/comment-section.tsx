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
} from '@/app/_components/ui/form';
import { Textarea } from '@/app/_components/ui/textarea';
import { Label } from '@/app/_components/ui/label';
import { Checkbox } from '@/app/_components/ui/checkbox';

// 1. Tipos de Dados
// Tipo para o comentário (incluindo o usuário)
type CommentWithUser = Comment & {
  user: Pick<User, 'name' | 'role' | 'photoUrl'>;
};

// Props que este componente recebe da página (Server Component)
interface CommentSectionProps {
  ticketId: string;
  initialComments: CommentWithUser[];
  currentUserRole: Role;
}

// 2. Schema de Validação (Zod)
const formSchema = z.object({
  text: z.string().min(1, 'O comentário não pode estar vazio'),
  isInternal: z.boolean().default(false),
});

export function CommentSection({
  ticketId,
  initialComments,
  currentUserRole,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.input<typeof formSchema>>({
    // <-- Mude de z.infer para z.input
    resolver: zodResolver(formSchema),
    defaultValues: { text: '', isInternal: false },
  });
  // 3. Handler de Submissão (POST /api/tickets/[id]/comments)
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

      // 4. Sucesso: Adiciona o novo comentário ao estado (UI Otimista)
      setComments((currentComments) => [...currentComments, newComment]);
      form.reset(); // Limpa o formulário
      toast.success('Comentário adicionado');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  // 5. Filtro de Comentários
  // Filtra comentários internos se o usuário for 'COMMON'
  const filteredComments =
    currentUserRole === Role.COMMON
      ? comments.filter((comment) => !comment.isInternal)
      : comments;

  return (
    <div className="space-y-6">
      {/* 6. Lista de Comentários */}
      <h3 className="text-xl font-semibold">Histórico do Chamado</h3>
      <div className="space-y-4">
        {filteredComments.length === 0 && (
          <p className="text-muted-foreground">Nenhum comentário ainda.</p>
        )}
        {filteredComments.map((comment) => (
          <div
            key={comment.id}
            className={`flex gap-3 ${
              comment.isInternal
                ? 'rounded-lg border-l-4 border-amber-300 bg-amber-50 p-3'
                : ''
            }`}
          >
            <Avatar>
              <AvatarImage src={comment.user.photoUrl || ''} />
              <AvatarFallback>
                {comment.user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{comment.user.name}</span>
                <span className="text-muted-foreground text-xs">
                  {format(
                    new Date(comment.createdAt),
                    "dd/MM/yyyy 'às' HH:mm",
                    {
                      locale: ptBR,
                    },
                  )}
                </span>
              </div>
              {comment.isInternal && (
                <span className="text-xs font-medium text-amber-700">
                  (Nota Interna - {comment.user.role})
                </span>
              )}
              <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 7. Formulário de Novo Comentário */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <Label>Adicionar Comentário</Label>
                <FormControl>
                  <Textarea
                    placeholder="Digite sua atualização ou resposta..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 8. Checkbox de "Nota Interna" */}
          {currentUserRole !== Role.COMMON && (
            <FormField
              control={form.control}
              name="isInternal"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label
                    htmlFor="isInternal"
                    className="font-normal text-amber-700"
                  >
                    Marcar como nota interna (visível apenas para a equipe)
                  </Label>
                </FormItem>
              )}
            />
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Comentário'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
