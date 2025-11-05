'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

// Componentes Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card'; // (Ajuste o caminho se necessário)
import { Button } from '@/app/_components/ui/button';
import { cn } from '@/app/_lib/utils';

// Props que o componente recebe da página (Server Component)
interface TicketRatingProps {
  ticketId: string;
  currentRating: number | null; // A nota que já foi dada (ou null)
}

export function TicketRating({ ticketId, currentRating }: TicketRatingProps) {
  // Estado para a nota que foi clicada/salva
  const [selectedRating, setSelectedRating] = useState(currentRating);
  // Estado para a nota que o rato está por cima
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Função chamada ao clicar numa estrela
  const handleRatingSubmit = async (rating: number) => {
    // Se o utilizador clicar na mesma estrela que já está selecionada,
    // não fazemos nada (ou poderíamos permitir limpar, mas vamos manter simples)
    if (rating === selectedRating) return;

    setIsLoading(true);

    try {
      // 1. Chamar a nossa API
      const response = await fetch(`/api/tickets/${ticketId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }), // Envia o rating (1-5)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar avaliação');
      }

      // 2. Sucesso
      toast.success('Avaliação enviada!', {
        description: `Obrigado pelo seu feedback (Nota ${rating}).`,
      });
      setSelectedRating(rating); // Atualiza o estado local para preencher as estrelas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como foi o seu atendimento?</CardTitle>
        <CardDescription>
          {selectedRating
            ? 'Obrigado pelo seu feedback!'
            : 'Por favor, avalie o atendimento deste chamado.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1; // (1, 2, 3, 4, 5)

            return (
              <Button
                key={ratingValue}
                variant="ghost"
                size="icon"
                onClick={() => handleRatingSubmit(ratingValue)}
                onMouseEnter={() => !isLoading && setHoverRating(ratingValue)}
                onMouseLeave={() => !isLoading && setHoverRating(null)}
                disabled={isLoading} // Desativa todos os botões enquanto carrega
                className="p-0"
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    // A estrela fica preenchida se:
                    // o 'hoverRating' for >= a ela
                    // OU se não houver 'hover', mas o 'selectedRating' for >= a ela
                    (hoverRating || selectedRating || 0) >= ratingValue
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300',
                  )}
                />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
