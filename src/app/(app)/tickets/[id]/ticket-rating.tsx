'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Star, Sparkles, Heart, ThumbsUp, Award, Loader2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { cn } from '@/app/_lib/utils';

interface TicketRatingProps {
  ticketId: string;
  currentRating: number | null;
}

// Configuração de feedback por rating
const RATING_CONFIG = {
  1: { label: 'Insatisfeito', emoji: '😞', color: 'from-red-500 to-rose-600' },
  2: {
    label: 'Pode melhorar',
    emoji: '😕',
    color: 'from-orange-500 to-amber-600',
  },
  3: {
    label: 'Satisfatório',
    emoji: '😐',
    color: 'from-yellow-500 to-amber-600',
  },
  4: { label: 'Bom', emoji: '😊', color: 'from-lime-500 to-emerald-600' },
  5: {
    label: 'Excelente!',
    emoji: '🤩',
    color: 'from-emerald-500 to-teal-600',
  },
};

export function TicketRating({ ticketId, currentRating }: TicketRatingProps) {
  const [selectedRating, setSelectedRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRatingSubmit = async (rating: number) => {
    if (rating === selectedRating) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar avaliação');
      }

      const config = RATING_CONFIG[rating as keyof typeof RATING_CONFIG];
      toast.success('Avaliação enviada com sucesso!', {
        description: `${config.emoji} ${config.label} - Obrigado pelo seu feedback!`,
      });
      setSelectedRating(rating);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao enviar avaliação', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const activeRating = hoverRating || selectedRating || 0;
  const ratingConfig =
    activeRating > 0
      ? RATING_CONFIG[activeRating as keyof typeof RATING_CONFIG]
      : null;

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl">
      {/* Gradient decorativo no topo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500" />

      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 p-2 shadow-lg">
                <Star className="h-4 w-4 fill-white text-white" />
              </div>
              Avaliação do Atendimento
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedRating
                ? 'Muito obrigado pelo seu feedback!'
                : 'Como foi sua experiência? Avalie nosso atendimento'}
            </CardDescription>
          </div>

          {/* Badge com nota atual */}
          {selectedRating && (
            <Badge
              className={`bg-gradient-to-r ${RATING_CONFIG[selectedRating as keyof typeof RATING_CONFIG].color} gap-1.5 border-0 px-3 py-1.5 text-white shadow-lg`}
            >
              <Award className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                {
                  RATING_CONFIG[selectedRating as keyof typeof RATING_CONFIG]
                    .label
                }
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Container das estrelas */}
        <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 dark:border-yellow-800 dark:from-yellow-950/30 dark:to-amber-950/30">
          {/* Feedback visual do hover/seleção */}
          <div className="mb-4 flex min-h-[60px] flex-col items-center justify-center gap-2">
            {ratingConfig ? (
              <>
                <span className="text-4xl">{ratingConfig.emoji}</span>
                <p
                  className={`bg-gradient-to-r ${ratingConfig.color} bg-clip-text text-lg font-bold text-transparent`}
                >
                  {ratingConfig.label}
                </p>
              </>
            ) : (
              <>
                <Sparkles className="h-8 w-8 text-yellow-500" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Selecione uma nota
                </p>
              </>
            )}
          </div>

          {/* Estrelas */}
          <div className="flex items-center justify-center gap-2">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              const isActive = activeRating >= ratingValue;
              const isHovered = hoverRating === ratingValue;

              return (
                <Button
                  key={ratingValue}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRatingSubmit(ratingValue)}
                  onMouseEnter={() => !isLoading && setHoverRating(ratingValue)}
                  onMouseLeave={() => !isLoading && setHoverRating(null)}
                  disabled={isLoading}
                  className={cn(
                    'group relative h-16 w-16 rounded-xl p-0 transition-all duration-200 hover:scale-110',
                    isActive && 'scale-105',
                    isHovered && 'scale-125 shadow-lg',
                  )}
                >
                  {/* Glow effect */}
                  {isActive && (
                    <div className="absolute inset-0 animate-pulse rounded-xl bg-yellow-400/20 blur-xl" />
                  )}

                  <Star
                    className={cn(
                      'relative h-10 w-10 transition-all duration-200',
                      isActive
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                        : 'fill-transparent text-slate-300 dark:text-slate-600',
                      isHovered && 'animate-bounce',
                    )}
                  />

                  {/* Número da estrela */}
                  <span
                    className={cn(
                      'absolute -bottom-1 text-xs font-bold transition-colors',
                      isActive
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-slate-400 dark:text-slate-600',
                    )}
                  >
                    {ratingValue}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enviando sua avaliação...</span>
            </div>
          )}
        </div>

        {/* Cards de feedback já avaliado */}
        {selectedRating && !isLoading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-3 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
                  <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Sua nota
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedRating} de 5
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-3 dark:border-amber-800 dark:from-amber-950/30 dark:to-yellow-950/30">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-1.5 dark:bg-amber-900/30">
                  <Star className="h-4 w-4 fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Avaliação
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {
                      RATING_CONFIG[
                        selectedRating as keyof typeof RATING_CONFIG
                      ].label
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-3 dark:border-pink-800 dark:from-pink-950/30 dark:to-rose-950/30">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-pink-100 p-1.5 dark:bg-pink-900/30">
                  <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Status
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Registrado
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de incentivo */}
        {!selectedRating && !isLoading && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Seu feedback é importante!
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ajude-nos a melhorar nossos serviços avaliando este atendimento
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
