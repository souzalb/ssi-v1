'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AutoRefresherProps {
  interval: number; // Intervalo em milissegundos
}

export function AutoRefresher({ interval }: AutoRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    // 1. Define o 'timer'
    const timer = setInterval(() => {
      console.log('Refreshing dashboard data...'); // (Para depuração)
      router.refresh(); // <-- A mágica acontece aqui
    }, interval);

    // 2. Função de limpeza
    // (Executada quando o componente é desmontado)
    return () => {
      clearInterval(timer);
    };
  }, [interval, router]); // Re-executa se o intervalo ou o router mudarem

  // Este componente não renderiza nada visível
  return null;
}
