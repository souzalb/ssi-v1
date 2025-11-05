'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/app/_components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalResults,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(pathname + '?' + params.toString());
  };

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="text-muted-foreground text-sm">
        Total de {totalResults} resultados.
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <span className="text-sm font-medium">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Próxima
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
