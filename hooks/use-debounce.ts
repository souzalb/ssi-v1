// hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  // Estado para guardar o valor "debounced"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Inicia um temporizador para atualizar o valor debounced
    // apenas após o 'delay' (ex: 500ms)
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Função de limpeza:
    // Se o 'value' mudar (o utilizador digitar mais),
    // o temporizador anterior é cancelado e um novo é iniciado.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Só re-executa se o valor ou o delay mudarem

  return debouncedValue;
}
